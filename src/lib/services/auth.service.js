import { supabase } from '$lib/supabaseClient'

/**
 * Authentication service
 * Handles user authentication operations
 */

/**
 * Sign in with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{data: object, error: object}>}
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw error
  }

  return data
}

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw error
  }
}

/**
 * Get the current session
 * @returns {Promise<object|null>}
 */
export async function getSession() {
  const {
    data: { session }
  } = await supabase.auth.getSession()

  return session
}

/**
 * Get the current user
 * @returns {Promise<object|null>}
 */
export async function getCurrentUser() {
  const {
    data: { user }
  } = await supabase.auth.getUser()

  return user
}

/**
 * Get user profile from the users table
 * @param {string} userId - The user's ID
 * @returns {Promise<object|null>}
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Failed to fetch user profile:', error.message)
    return null
  }

  return data
}

/**
 * Subscribe to auth state changes
 * @param {function} callback - Callback function for auth state changes
 * @returns {function} - Unsubscribe function
 */
export function onAuthStateChange(callback) {
  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })

  return () => {
    subscription.unsubscribe()
  }
}
