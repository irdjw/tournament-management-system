import { createClient } from '@supabase/supabase-js'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

/**
 * Supabase client for browser-side operations
 * Uses the public anon key for client-side requests
 */
export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY)

/**
 * Creates a Supabase client with the user's session
 * Use this for authenticated requests in load functions
 * @param {string} accessToken - The user's access token
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 */
export function createAuthenticatedClient(accessToken) {
  return createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  })
}
