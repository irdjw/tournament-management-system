import { supabase } from '$lib/supabaseClient'

/**
 * Real-time Service
 * Handles Supabase real-time subscriptions for live updates
 */

/**
 * Subscribe to match updates
 * @param {string} matchId - Match UUID
 * @param {function} onUpdate - Callback when data changes
 * @returns {function} - Unsubscribe function
 */
export function subscribeToMatch(matchId, onUpdate) {
  const channel = supabase
    .channel(`match-${matchId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `id=eq.${matchId}`
      },
      (payload) => {
        onUpdate({ type: 'match', payload })
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'legs',
        filter: `match_id=eq.${matchId}`
      },
      (payload) => {
        onUpdate({ type: 'leg', payload })
      }
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to leg updates (turns and darts)
 * @param {string} legId - Leg UUID
 * @param {function} onUpdate - Callback when data changes
 * @returns {function} - Unsubscribe function
 */
export function subscribeToLeg(legId, onUpdate) {
  const channel = supabase
    .channel(`leg-${legId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'legs',
        filter: `id=eq.${legId}`
      },
      (payload) => {
        onUpdate({ type: 'leg', payload })
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'turns',
        filter: `leg_id=eq.${legId}`
      },
      (payload) => {
        onUpdate({ type: 'turn', payload })
      }
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to turn updates (darts)
 * @param {string} turnId - Turn UUID
 * @param {function} onUpdate - Callback when data changes
 * @returns {function} - Unsubscribe function
 */
export function subscribeToTurn(turnId, onUpdate) {
  const channel = supabase
    .channel(`turn-${turnId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'darts',
        filter: `turn_id=eq.${turnId}`
      },
      (payload) => {
        onUpdate({ type: 'dart', payload })
      }
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to tournament bracket updates
 * @param {string} tournamentId - Tournament UUID
 * @param {function} onUpdate - Callback when data changes
 * @returns {function} - Unsubscribe function
 */
export function subscribeToTournament(tournamentId, onUpdate) {
  const channel = supabase
    .channel(`tournament-${tournamentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `tournament_id=eq.${tournamentId}`
      },
      (payload) => {
        onUpdate({ type: 'match', payload })
      }
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Subscribe to scorer's assigned matches
 * @param {string} scorerId - User UUID
 * @param {function} onUpdate - Callback when data changes
 * @returns {function} - Unsubscribe function
 */
export function subscribeToScorerMatches(scorerId, onUpdate) {
  const channel = supabase
    .channel(`scorer-${scorerId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matches',
        filter: `assigned_to_user_id=eq.${scorerId}`
      },
      (payload) => {
        onUpdate({ type: 'match', payload })
      }
    )
    .subscribe()

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel)
  }
}
