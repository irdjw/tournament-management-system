import { supabase } from '$lib/supabaseClient'

/**
 * Player Service
 * Handles all player-related database operations
 */

/**
 * Create a new player
 * @param {string} name - Player name
 * @param {string|null} email - Player email (optional)
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function createPlayer(name, email = null) {
  const { data: { user } } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('players')
    .insert({
      name,
      email,
      created_by: user.id
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Get all players
 * @param {object} options - Query options
 * @param {string} options.search - Search term for filtering
 * @param {number} options.limit - Maximum number of results
 * @param {number} options.offset - Offset for pagination
 * @returns {Promise<{data: array|null, error: object|null, count: number|null}>}
 */
export async function getPlayers({ search = '', limit = 50, offset = 0 } = {}) {
  let query = supabase
    .from('players')
    .select('*', { count: 'exact' })
    .order('name', { ascending: true })
    .range(offset, offset + limit - 1)

  if (search) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error, count } = await query

  return { data, error, count }
}

/**
 * Get a single player by ID
 * @param {string} id - Player UUID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getPlayer(id) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single()

  return { data, error }
}

/**
 * Get player with their tournament registrations
 * @param {string} id - Player UUID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getPlayerWithTournaments(id) {
  const { data, error } = await supabase
    .from('players')
    .select(`
      *,
      tournament_players (
        id,
        seed_number,
        registered_at,
        tournament:tournaments (
          id,
          name,
          status,
          format
        )
      )
    `)
    .eq('id', id)
    .single()

  return { data, error }
}

/**
 * Update a player
 * @param {string} id - Player UUID
 * @param {object} updates - Fields to update
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updatePlayer(id, updates) {
  const { data, error } = await supabase
    .from('players')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data, error }
}

/**
 * Delete a player
 * @param {string} id - Player UUID
 * @returns {Promise<{error: object|null}>}
 */
export async function deletePlayer(id) {
  const { error } = await supabase
    .from('players')
    .delete()
    .eq('id', id)

  return { error }
}

/**
 * Get players not registered in a specific tournament
 * @param {string} tournamentId - Tournament UUID
 * @returns {Promise<{data: array|null, error: object|null}>}
 */
export async function getAvailablePlayers(tournamentId) {
  // Get all players
  const { data: allPlayers, error: playersError } = await supabase
    .from('players')
    .select('*')
    .order('name', { ascending: true })

  if (playersError) return { data: null, error: playersError }

  // Get registered player IDs for this tournament
  const { data: registered, error: regError } = await supabase
    .from('tournament_players')
    .select('player_id')
    .eq('tournament_id', tournamentId)

  if (regError) return { data: null, error: regError }

  const registeredIds = new Set(registered.map(r => r.player_id))
  const available = allPlayers.filter(p => !registeredIds.has(p.id))

  return { data: available, error: null }
}
