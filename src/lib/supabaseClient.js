import { createClient } from '@supabase/supabase-js'
import { env } from '$env/dynamic/public'

const supabaseUrl = env.PUBLIC_SUPABASE_URL
const supabaseAnonKey = env.PUBLIC_SUPABASE_ANON_KEY

/**
 * Supabase client for browser-side operations
 * Uses the public anon key for client-side requests
 */
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

/**
 * Creates a Supabase client with the user's session
 * Use this for authenticated requests in load functions
 * @param {string} accessToken - The user's access token
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createAuthenticatedClient(accessToken) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables not configured')
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
}
