import { writable, derived } from 'svelte/store'

/**
 * Authentication store
 * Manages user session and authentication state
 */

// Create writable stores for session and user
const sessionStore = writable(null)
const userStore = writable(null)
const loadingStore = writable(true)

/**
 * Set the current session
 * @param {object|null} session - The session object
 */
export function setSession(session) {
  sessionStore.set(session)
}

/**
 * Set the current user
 * @param {object|null} user - The user object
 */
export function setUser(user) {
  userStore.set(user)
}

/**
 * Set the loading state
 * @param {boolean} loading - Whether auth is loading
 */
export function setLoading(loading) {
  loadingStore.set(loading)
}

/**
 * Clear all auth state
 */
export function clearAuth() {
  sessionStore.set(null)
  userStore.set(null)
  loadingStore.set(false)
}

// Derived store to check if user is authenticated
export const isAuthenticated = derived(sessionStore, ($session) => !!$session)

// Export stores
export const session = {
  subscribe: sessionStore.subscribe
}

export const user = {
  subscribe: userStore.subscribe
}

export const authLoading = {
  subscribe: loadingStore.subscribe
}
