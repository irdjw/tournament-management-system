import { createClient } from '@supabase/supabase-js'

let supabaseInstance = null

/**
 * Get or create Supabase client for browser-side operations
 * Uses lazy initialization to avoid build-time env access
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
function getClient() {
  if (supabaseInstance) return supabaseInstance

  const url = import.meta.env.PUBLIC_SUPABASE_URL
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error('Supabase environment variables not configured')
    return null
  }

  supabaseInstance = createClient(url, key)
  return supabaseInstance
}

/**
 * Proxy that lazily initializes the Supabase client on first access
 * This allows services to import `supabase` and use it without issues
 */
export const supabase = new Proxy({}, {
  get(target, prop) {
    const client = getClient()
    if (!client) {
      throw new Error('Supabase client not initialized - check environment variables')
    }
    return client[prop]
  }
})

/**
 * Creates a Supabase client with the user's session
 * Use this for authenticated requests in load functions
 * @param {string} accessToken - The user's access token
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createAuthenticatedClient(accessToken) {
  const url = import.meta.env.PUBLIC_SUPABASE_URL
  const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables not configured')
  }

  return createClient(url, key, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
}
