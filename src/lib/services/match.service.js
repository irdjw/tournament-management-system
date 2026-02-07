import { supabase } from '$lib/supabaseClient'

/**
 * Match Service
 * Handles match-related database operations
 */

/**
 * Get all matches for a tournament
 * @param {string} tournamentId - Tournament UUID
 * @returns {Promise<{data: array|null, error: object|null}>}
 */
export async function getMatchesForTournament(tournamentId) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      player1:tournament_players!matches_player1_id_fkey (
        id,
        seed_number,
        player:players (id, name)
      ),
      player2:tournament_players!matches_player2_id_fkey (
        id,
        seed_number,
        player:players (id, name)
      ),
      winner:tournament_players!matches_winner_id_fkey (
        id,
        player:players (id, name)
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

  return { data, error }
}

/**
 * Get a single match with full details
 * @param {string} matchId - Match UUID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getMatch(matchId) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      tournament:tournaments (
        id,
        name,
        default_best_of_legs,
        default_starting_score
      ),
      player1:tournament_players!matches_player1_id_fkey (
        id,
        seed_number,
        player:players (id, name, email)
      ),
      player2:tournament_players!matches_player2_id_fkey (
        id,
        seed_number,
        player:players (id, name, email)
      ),
      winner:tournament_players!matches_winner_id_fkey (
        id,
        player:players (id, name)
      ),
      scorer:users!matches_assigned_to_user_id_fkey (
        id,
        display_name,
        email
      )
    `)
    .eq('id', matchId)
    .single()

  return { data, error }
}

/**
 * Assign a scorer to a match
 * @param {string} matchId - Match UUID
 * @param {string} scorerId - User UUID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function assignMatchToScorer(matchId, scorerId) {
  const { data, error } = await supabase
    .from('matches')
    .update({
      assigned_to_user_id: scorerId,
      status: 'assigned',
      assigned_at: new Date().toISOString()
    })
    .eq('id', matchId)
    .select()
    .single()

  return { data, error }
}

/**
 * Unassign a scorer from a match
 * @param {string} matchId - Match UUID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function unassignMatch(matchId) {
  const { data, error } = await supabase
    .from('matches')
    .update({
      assigned_to_user_id: null,
      status: 'pending',
      assigned_at: null
    })
    .eq('id', matchId)
    .select()
    .single()

  return { data, error }
}

/**
 * Update match status
 * @param {string} matchId - Match UUID
 * @param {string} status - New status
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateMatchStatus(matchId, status) {
  const updates = { status }

  if (status === 'in_progress') {
    updates.started_at = new Date().toISOString()
  } else if (status === 'completed') {
    updates.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', matchId)
    .select()
    .single()

  return { data, error }
}

/**
 * Record match winner and update legs won
 * @param {string} matchId - Match UUID
 * @param {string} winnerId - Tournament player UUID
 * @param {number} player1LegsWon - Legs won by player 1
 * @param {number} player2LegsWon - Legs won by player 2
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function recordMatchWinner(matchId, winnerId, player1LegsWon, player2LegsWon) {
  const { data, error } = await supabase
    .from('matches')
    .update({
      winner_id: winnerId,
      player1_legs_won: player1LegsWon,
      player2_legs_won: player2LegsWon,
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', matchId)
    .select()
    .single()

  if (error) return { data: null, error }

  // Advance winner to next match
  await advanceWinnerToNextMatch(matchId, winnerId)

  return { data, error: null }
}

/**
 * Advance winner to the next match in bracket
 * @param {string} matchId - Completed match UUID
 * @param {string} winnerId - Tournament player UUID
 */
async function advanceWinnerToNextMatch(matchId, winnerId) {
  // Get the match to find feeds_into
  const { data: match, error } = await supabase
    .from('matches')
    .select('feeds_into_match_id, player1_id, player2_id')
    .eq('id', matchId)
    .single()

  if (error || !match.feeds_into_match_id) return

  // Get the next match
  const { data: nextMatch } = await supabase
    .from('matches')
    .select('player1_from_match_id, player2_from_match_id')
    .eq('id', match.feeds_into_match_id)
    .single()

  if (!nextMatch) return

  // Determine which slot the winner goes into
  const update = nextMatch.player1_from_match_id === matchId
    ? { player1_id: winnerId }
    : { player2_id: winnerId }

  await supabase
    .from('matches')
    .update(update)
    .eq('id', match.feeds_into_match_id)
}

/**
 * Get matches assigned to a specific scorer
 * @param {string} scorerId - User UUID
 * @returns {Promise<{data: array|null, error: object|null}>}
 */
export async function getMatchesForScorer(scorerId) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      tournament:tournaments (
        id,
        name,
        default_best_of_legs,
        default_starting_score
      ),
      player1:tournament_players!matches_player1_id_fkey (
        id,
        player:players (id, name)
      ),
      player2:tournament_players!matches_player2_id_fkey (
        id,
        player:players (id, name)
      )
    `)
    .eq('assigned_to_user_id', scorerId)
    .in('status', ['assigned', 'in_progress'])
    .order('assigned_at', { ascending: true })

  return { data, error }
}

/**
 * Get all scorers (users with scorer role)
 * @returns {Promise<{data: array|null, error: object|null}>}
 */
export async function getScorers() {
  const { data, error } = await supabase
    .from('users')
    .select('id, email, display_name')
    .in('role', ['scorer', 'tournament_admin', 'venue_admin', 'system_admin'])
    .order('display_name', { ascending: true })

  return { data, error }
}
