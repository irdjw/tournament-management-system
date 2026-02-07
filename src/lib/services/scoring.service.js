import { supabase } from '$lib/supabaseClient'
import { calculateDartValue, isBust, isCheckout } from '$lib/utils/scoring.utils'

/**
 * Scoring Service
 * Handles all scoring-related database operations
 */

/**
 * Start a new leg
 * @param {string} matchId - Match UUID
 * @param {number} legNumber - Leg number
 * @param {string} player1Id - Tournament player 1 UUID
 * @param {string} player2Id - Tournament player 2 UUID
 * @param {number} startingScore - Starting score (e.g., 501)
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function startLeg(matchId, legNumber, player1Id, player2Id, startingScore) {
  const { data, error } = await supabase
    .from('legs')
    .insert({
      match_id: matchId,
      leg_number: legNumber,
      player1_id: player1Id,
      player2_id: player2Id,
      player1_starting_score: startingScore,
      player2_starting_score: startingScore,
      started_at: new Date().toISOString()
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Get active leg for a match
 * @param {string} matchId - Match UUID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getActiveLeg(matchId) {
  const { data, error } = await supabase
    .from('legs')
    .select('*')
    .eq('match_id', matchId)
    .is('winner_id', null)
    .order('leg_number', { ascending: false })
    .limit(1)
    .single()

  return { data, error }
}

/**
 * Get all legs for a match
 * @param {string} matchId - Match UUID
 * @returns {Promise<{data: array|null, error: object|null}>}
 */
export async function getLegsForMatch(matchId) {
  const { data, error } = await supabase
    .from('legs')
    .select('*')
    .eq('match_id', matchId)
    .order('leg_number', { ascending: true })

  return { data, error }
}

/**
 * Get leg with all turns and darts
 * @param {string} legId - Leg UUID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getLegWithScoring(legId) {
  const { data, error } = await supabase
    .from('legs')
    .select(`
      *,
      turns (
        *,
        darts (*)
      )
    `)
    .eq('id', legId)
    .single()

  return { data, error }
}

/**
 * Start a new turn
 * @param {string} legId - Leg UUID
 * @param {string} playerId - Tournament player UUID
 * @param {number} turnNumber - Turn number
 * @param {number} scoreBefore - Score before this turn
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function startTurn(legId, playerId, turnNumber, scoreBefore) {
  const { data, error } = await supabase
    .from('turns')
    .insert({
      leg_id: legId,
      player_id: playerId,
      turn_number: turnNumber,
      score_before: scoreBefore,
      score_after: scoreBefore,
      turn_total: 0
    })
    .select()
    .single()

  return { data, error }
}

/**
 * Get the current turn for a leg
 * @param {string} legId - Leg UUID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getCurrentTurn(legId) {
  const { data, error } = await supabase
    .from('turns')
    .select(`
      *,
      darts (*)
    `)
    .eq('leg_id', legId)
    .order('turn_number', { ascending: false })
    .limit(1)
    .single()

  return { data, error }
}

/**
 * Record a dart throw
 * @param {string} turnId - Turn UUID
 * @param {number} dartNumber - Dart number (1, 2, or 3)
 * @param {number} multiplier - 1 (single), 2 (double), 3 (treble)
 * @param {number} number - 0-20 or 25
 * @param {number} currentScore - Current score before this dart
 * @returns {Promise<{data: object|null, error: object|null, isBust: boolean, isCheckout: boolean}>}
 */
export async function recordDart(turnId, dartNumber, multiplier, number, currentScore) {
  const value = calculateDartValue(multiplier, number)
  const dartIsBust = isBust(currentScore, value, multiplier)
  const dartIsCheckout = isCheckout(currentScore, value, multiplier)

  const { data, error } = await supabase
    .from('darts')
    .insert({
      turn_id: turnId,
      dart_number: dartNumber,
      multiplier,
      number,
      value,
      is_bust: dartIsBust
    })
    .select()
    .single()

  return { data, error, isBust: dartIsBust, isCheckout: dartIsCheckout }
}

/**
 * Delete the last dart from a turn
 * @param {string} turnId - Turn UUID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function undoLastDart(turnId) {
  // Get the last dart
  const { data: lastDart, error: fetchError } = await supabase
    .from('darts')
    .select('*')
    .eq('turn_id', turnId)
    .order('dart_number', { ascending: false })
    .limit(1)
    .single()

  if (fetchError || !lastDart) {
    return { data: null, error: fetchError || { message: 'No dart to undo' } }
  }

  // Delete it
  const { error } = await supabase
    .from('darts')
    .delete()
    .eq('id', lastDart.id)

  return { data: lastDart, error }
}

/**
 * Complete a turn (update totals)
 * @param {string} turnId - Turn UUID
 * @param {number} turnTotal - Total score for the turn
 * @param {number} scoreAfter - Score after this turn
 * @param {boolean} isCheckoutAttempt - Was this a checkout attempt
 * @param {boolean} isSuccessfulCheckout - Was the checkout successful
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function completeTurn(turnId, turnTotal, scoreAfter, isCheckoutAttempt = false, isSuccessfulCheckout = false) {
  const { data, error } = await supabase
    .from('turns')
    .update({
      turn_total: turnTotal,
      score_after: scoreAfter,
      is_checkout_attempt: isCheckoutAttempt,
      is_successful_checkout: isSuccessfulCheckout
    })
    .eq('id', turnId)
    .select()
    .single()

  return { data, error }
}

/**
 * Complete a leg
 * @param {string} legId - Leg UUID
 * @param {string} winnerId - Tournament player UUID
 * @param {number} player1FinalScore - Player 1 final score
 * @param {number} player2FinalScore - Player 2 final score
 * @param {number} totalDartsThrown - Total darts thrown in leg
 * @param {number} checkoutDart - Which dart finished (1, 2, or 3)
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function completeLeg(legId, winnerId, player1FinalScore, player2FinalScore, totalDartsThrown, checkoutDart) {
  const { data, error } = await supabase
    .from('legs')
    .update({
      winner_id: winnerId,
      player1_final_score: player1FinalScore,
      player2_final_score: player2FinalScore,
      total_darts_thrown: totalDartsThrown,
      checkout_dart: checkoutDart,
      completed_at: new Date().toISOString()
    })
    .eq('id', legId)
    .select()
    .single()

  return { data, error }
}

/**
 * Update match legs won count
 * @param {string} matchId - Match UUID
 * @param {number} player1LegsWon - Player 1 legs won
 * @param {number} player2LegsWon - Player 2 legs won
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function updateMatchLegsWon(matchId, player1LegsWon, player2LegsWon) {
  const { data, error } = await supabase
    .from('matches')
    .update({
      player1_legs_won: player1LegsWon,
      player2_legs_won: player2LegsWon
    })
    .eq('id', matchId)
    .select()
    .single()

  return { data, error }
}

/**
 * Complete a match
 * @param {string} matchId - Match UUID
 * @param {string} winnerId - Tournament player UUID
 * @param {number} player1LegsWon - Player 1 legs won
 * @param {number} player2LegsWon - Player 2 legs won
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function completeMatch(matchId, winnerId, player1LegsWon, player2LegsWon) {
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
  await advanceWinner(matchId, winnerId)

  return { data, error: null }
}

/**
 * Advance winner to next match in bracket
 * @param {string} matchId - Completed match UUID
 * @param {string} winnerId - Winner's tournament player UUID
 */
async function advanceWinner(matchId, winnerId) {
  // Get the match to find feeds_into
  const { data: match } = await supabase
    .from('matches')
    .select('feeds_into_match_id')
    .eq('id', matchId)
    .single()

  if (!match?.feeds_into_match_id) return

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
 * Get match scoring state (current leg, scores, etc.)
 * @param {string} matchId - Match UUID
 * @returns {Promise<{data: object|null, error: object|null}>}
 */
export async function getMatchScoringState(matchId) {
  // Get match details
  const { data: match, error: matchError } = await supabase
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
    .eq('id', matchId)
    .single()

  if (matchError) return { data: null, error: matchError }

  // Get legs
  const { data: legs } = await supabase
    .from('legs')
    .select(`
      *,
      turns (
        *,
        darts (*)
      )
    `)
    .eq('match_id', matchId)
    .order('leg_number', { ascending: true })

  return {
    data: {
      match,
      legs: legs || []
    },
    error: null
  }
}
