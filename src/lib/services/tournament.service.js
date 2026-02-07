import { supabase } from '$lib/supabaseClient'

/**
 * Tournament Service
 * Handles all tournament-related database operations
 */

/**
 * Create a new tournament
 * @param {object} tournamentData - Tournament details
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function createTournament(tournamentData) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('tournaments')
    .insert({
      name: tournamentData.name,
      game_type_id: tournamentData.gameTypeId,
      format: tournamentData.format || 'knockout',
      default_best_of_legs: tournamentData.bestOfLegs || 5,
      default_starting_score: tournamentData.startingScore || 501,
      created_by: user.id,
      managed_by: user.id,
      settings: tournamentData.settings || {}
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Get all tournaments with game type info
 * @param {object} options - Query options
 * @returns {Promise<{data: array|null, error: object|null}>}
 */
export async function getTournaments({ status = null, limit = 50 } = {}) {
  let query = supabase
    .from('tournaments')
    .select(`
      *,
      game_type:game_types (
        id,
        name,
        display_name
      ),
      tournament_players (count)
    `)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  return { data, error }
}

/**
 * Get a single tournament with all details
 * @param {string} id - Tournament UUID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getTournament(id) {
  const { data, error } = await supabase
    .from('tournaments')
    .select(`
      *,
      game_type:game_types (
        id,
        name,
        display_name,
        config
      ),
      tournament_players (
        id,
        seed_number,
        player:players (
          id,
          name,
          email
        )
      )
    `)
    .eq('id', id)
    .single()

  return { data, error }
}

/**
 * Update a tournament
 * @param {string} id - Tournament UUID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateTournament(id, updates) {
  const { data, error } = await supabase
    .from('tournaments')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

/**
 * Update tournament status
 * @param {string} id - Tournament UUID
 * @param {string} status - New status
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateTournamentStatus(id, status) {
  return updateTournament(id, { status })
}

/**
 * Delete a tournament
 * @param {string} id - Tournament UUID
 * @returns {Promise<{error: object|null}>}
 */
export async function deleteTournament(id) {
  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', id)

  return { error }
}

/**
 * Add a player to a tournament
 * @param {string} tournamentId - Tournament UUID
 * @param {string} playerId - Player UUID
 * @param {number|null} seedNumber - Seed number (optional)
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function addPlayerToTournament(tournamentId, playerId, seedNumber = null) {
  const { data, error } = await supabase
    .from('tournament_players')
    .insert({
      tournament_id: tournamentId,
      player_id: playerId,
      seed_number: seedNumber
    })
    .select(`
      *,
      player:players (
        id,
        name,
        email
      )
    `)
    .single()

  return { data, error }
}

/**
 * Remove a player from a tournament
 * @param {string} tournamentId - Tournament UUID
 * @param {string} playerId - Player UUID
 * @returns {Promise<{error: object|null}>}
 */
export async function removePlayerFromTournament(tournamentId, playerId) {
  const { error } = await supabase
    .from('tournament_players')
    .delete()
    .eq('tournament_id', tournamentId)
    .eq('player_id', playerId)

  return { error }
}

/**
 * Update player seeds in a tournament
 * @param {string} tournamentId - Tournament UUID
 * @param {Array<{playerId: string, seedNumber: number}>} seeds - Player seeds
 * @returns {Promise<{error: object|null}>}
 */
export async function updatePlayerSeeds(tournamentId, seeds) {
  const updates = seeds.map(({ playerId, seedNumber }) =>
    supabase
      .from('tournament_players')
      .update({ seed_number: seedNumber })
      .eq('tournament_id', tournamentId)
      .eq('player_id', playerId)
  )

  const results = await Promise.all(updates)
  const error = results.find(r => r.error)?.error || null

  return { error }
}

/**
 * Get all game types
 * @returns {Promise<{data: array|null, error: object|null}>}
 */
export async function getGameTypes() {
  const { data, error } = await supabase
    .from('game_types')
    .select('*')
    .order('name', { ascending: true })

  return { data, error }
}

/**
 * Check if player count is valid for knockout format
 * @param {number} count - Number of players
 * @returns {boolean}
 */
export function isValidKnockoutPlayerCount(count) {
  const validCounts = [4, 8, 16, 32, 64]
  return validCounts.includes(count)
}

/**
 * Get the next valid player count for knockout
 * @param {number} current - Current player count
 * @returns {number}
 */
export function getNextValidPlayerCount(current) {
  const validCounts = [4, 8, 16, 32, 64]
  return validCounts.find(c => c >= current) || 64
}
