import { supabase } from '$lib/supabaseClient'

/**
 * Bracket Service
 * Handles knockout bracket generation and management
 */

/**
 * Generate a knockout bracket for a tournament
 * @param {string} tournamentId - Tournament UUID
 * @returns {Promise<{data: array|null, error: object|null}>}
 */
export async function generateKnockoutBracket(tournamentId) {
  // Get tournament with players
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select(`
      *,
      tournament_players (
        id,
        seed_number,
        player:players (
          id,
          name
        )
      )
    `)
    .eq('id', tournamentId)
    .single()

  if (tournamentError) return { data: null, error: tournamentError }

  const players = tournament.tournament_players
  const playerCount = players.length

  // Validate player count
  const validCounts = [4, 8, 16, 32, 64]
  if (!validCounts.includes(playerCount)) {
    return {
      data: null,
      error: { message: `Invalid player count: ${playerCount}. Must be 4, 8, 16, 32, or 64.` }
    }
  }

  // Sort players by seed (or registration order if no seeds)
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.seed_number && b.seed_number) return a.seed_number - b.seed_number
    if (a.seed_number) return -1
    if (b.seed_number) return 1
    return 0
  })

  // Calculate number of rounds
  const numRounds = Math.log2(playerCount)

  // Generate seeded pairings for first round
  const firstRoundPairings = generateSeededPairings(sortedPlayers)

  // Create all matches
  const matches = []
  let matchPosition = 0

  // Create first round matches (highest round number)
  for (let i = 0; i < firstRoundPairings.length; i++) {
    const [player1, player2] = firstRoundPairings[i]
    matches.push({
      tournament_id: tournamentId,
      player1_id: player1.id,
      player2_id: player2.id,
      round: numRounds,
      position_in_round: i + 1,
      best_of_legs: tournament.default_best_of_legs,
      starting_score: tournament.default_starting_score,
      status: 'pending'
    })
  }

  // Create subsequent round matches (empty, waiting for winners)
  for (let round = numRounds - 1; round >= 1; round--) {
    const matchesInRound = Math.pow(2, round - 1)
    for (let pos = 1; pos <= matchesInRound; pos++) {
      matches.push({
        tournament_id: tournamentId,
        player1_id: null,
        player2_id: null,
        round: round,
        position_in_round: pos,
        best_of_legs: tournament.default_best_of_legs,
        starting_score: tournament.default_starting_score,
        status: 'pending'
      })
    }
  }

  // Insert all matches
  const { data: insertedMatches, error: insertError } = await supabase
    .from('matches')
    .insert(matches)
    .select()
    .order('round', { ascending: false })
    .order('position_in_round', { ascending: true })

  if (insertError) return { data: null, error: insertError }

  // Set up feeds_into relationships
  await setupBracketRelationships(insertedMatches, numRounds)

  // Update tournament status to in_progress
  await supabase
    .from('tournaments')
    .update({ status: 'in_progress' })
    .eq('id', tournamentId)

  // Return the complete bracket
  return getBracket(tournamentId)
}

/**
 * Generate seeded pairings (1 vs 8, 2 vs 7, etc.)
 * @param {array} players - Sorted players array
 * @returns {array} - Array of [player1, player2] pairs
 */
function generateSeededPairings(players) {
  const n = players.length
  const pairings = []

  // Standard knockout seeding: 1v8, 4v5, 2v7, 3v6 for 8 players
  // This ensures top seeds meet later in tournament
  const bracketOrder = generateBracketOrder(n)

  for (let i = 0; i < n; i += 2) {
    const idx1 = bracketOrder[i]
    const idx2 = bracketOrder[i + 1]
    pairings.push([players[idx1], players[idx2]])
  }

  return pairings
}

/**
 * Generate bracket order for proper seeding
 * @param {number} n - Number of players
 * @returns {array} - Order of seed indices
 */
function generateBracketOrder(n) {
  if (n === 2) return [0, 1]

  const halfOrder = generateBracketOrder(n / 2)
  const order = []

  for (const pos of halfOrder) {
    order.push(pos)
    order.push(n - 1 - pos)
  }

  return order
}

/**
 * Set up feeds_into and player_from relationships
 * @param {array} matches - All matches
 * @param {number} numRounds - Number of rounds
 */
async function setupBracketRelationships(matches, numRounds) {
  const matchesByRound = {}
  for (const match of matches) {
    if (!matchesByRound[match.round]) matchesByRound[match.round] = []
    matchesByRound[match.round].push(match)
  }

  // Sort each round by position
  for (const round of Object.keys(matchesByRound)) {
    matchesByRound[round].sort((a, b) => a.position_in_round - b.position_in_round)
  }

  const updates = []

  // For each round except the final, set up feeds_into
  for (let round = numRounds; round > 1; round--) {
    const currentRoundMatches = matchesByRound[round]
    const nextRoundMatches = matchesByRound[round - 1]

    for (let i = 0; i < currentRoundMatches.length; i++) {
      const match = currentRoundMatches[i]
      const nextMatchIndex = Math.floor(i / 2)
      const nextMatch = nextRoundMatches[nextMatchIndex]

      // Determine if winner goes to player1 or player2 slot
      const isPlayer1Slot = i % 2 === 0

      updates.push(
        supabase
          .from('matches')
          .update({
            feeds_into_match_id: nextMatch.id
          })
          .eq('id', match.id)
      )

      // Update next match with source references
      const sourceUpdate = isPlayer1Slot
        ? { player1_from_match_id: match.id }
        : { player2_from_match_id: match.id }

      updates.push(
        supabase
          .from('matches')
          .update(sourceUpdate)
          .eq('id', nextMatch.id)
      )
    }
  }

  await Promise.all(updates)
}

/**
 * Get the complete bracket for a tournament
 * @param {string} tournamentId - Tournament UUID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getBracket(tournamentId) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      player1:tournament_players!matches_player1_id_fkey (
        id,
        seed_number,
        player:players (
          id,
          name
        )
      ),
      player2:tournament_players!matches_player2_id_fkey (
        id,
        seed_number,
        player:players (
          id,
          name
        )
      ),
      winner:tournament_players!matches_winner_id_fkey (
        id,
        player:players (
          id,
          name
        )
      ),
      scorer:users!matches_assigned_to_user_id_fkey (
        id,
        display_name,
        email
      )
    `)
    .eq('tournament_id', tournamentId)
    .order('round', { ascending: false })
    .order('position_in_round', { ascending: true })

  if (error) return { data: null, error }

  // Organise matches by round
  const bracket = {
    rounds: {},
    totalRounds: 0
  }

  for (const match of data) {
    if (!bracket.rounds[match.round]) {
      bracket.rounds[match.round] = []
    }
    bracket.rounds[match.round].push(match)
    bracket.totalRounds = Math.max(bracket.totalRounds, match.round)
  }

  return { data: bracket, error: null }
}

/**
 * Get round name based on round number and total rounds
 * @param {number} round - Round number (1 = final)
 * @param {number} totalRounds - Total number of rounds
 * @returns {string}
 */
export function getRoundName(round, totalRounds) {
  if (round === 1) return 'Final'
  if (round === 2) return 'Semi-Finals'
  if (round === 3) return 'Quarter-Finals'
  if (round === 4) return 'Round of 16'
  if (round === 5) return 'Round of 32'
  return `Round ${totalRounds - round + 1}`
}
