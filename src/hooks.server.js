import { createServerClient } from '@supabase/ssr'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'
import { redirect } from '@sveltejs/kit'

/**
 * SvelteKit hooks for Supabase authentication
 * Handles session management and route protection
 */
export async function handle({ event, resolve }) {
  // Create a Supabase client for server-side operations
  event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
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
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession()
    return session
  }

  // Helper function to get the current user
  event.locals.getUser = async () => {
    const {
      data: { user }
    } = await event.locals.supabase.auth.getUser()
    return user
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
}
