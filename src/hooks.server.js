import { createServerClient } from '@supabase/ssr'
import { redirect } from '@sveltejs/kit'

/**
 * SvelteKit hooks for Supabase authentication
 * Handles session management and route protection
 */
export async function handle({ event, resolve }) {
  try {
    // Use process.env for server-side (Netlify Functions)
    const supabaseUrl = process.env.PUBLIC_SUPABASE_URL || ''
    const supabaseAnonKey = process.env.PUBLIC_SUPABASE_ANON_KEY || ''

    // Skip Supabase if not configured
    if (!supabaseUrl || !supabaseAnonKey) {
      event.locals.supabase = null
      event.locals.getSession = async () => null
      event.locals.getUser = async () => null
      return resolve(event)
    }

    // Create a Supabase client for server-side operations
    event.locals.supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => event.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            event.cookies.set(name, value, { ...options, path: '/' })
          })
        }
      }
    })

    // Helper function to get the current session
    event.locals.getSession = async () => {
      try {
        const {
          data: { session }
        } = await event.locals.supabase.auth.getSession()
        return session
      } catch (err) {
        console.error('Error getting session:', err)
        return null
      }
    }

    // Helper function to get the current user
    event.locals.getUser = async () => {
      try {
        const {
          data: { user }
        } = await event.locals.supabase.auth.getUser()
        return user
      } catch (err) {
        console.error('Error getting user:', err)
        return null
      }
    }

    // Protect admin routes
    if (event.url.pathname.startsWith('/admin')) {
      const session = await event.locals.getSession()
      if (!session) {
        throw redirect(303, '/login')
      }
    }

    // Protect scorer routes
    if (event.url.pathname.startsWith('/scorer')) {
      const session = await event.locals.getSession()
      if (!session) {
        throw redirect(303, '/login')
      }
    }

    return resolve(event, {
      filterSerializedResponseHeaders(name) {
        return name === 'content-range' || name === 'x-supabase-api-version'
      }
    })
  } catch (err) {
    // Re-throw redirects
    if (err?.status === 303) {
      throw err
    }
    console.error('Hook error:', err)
    // Return a basic response instead of crashing
    return resolve(event)
  }
}
