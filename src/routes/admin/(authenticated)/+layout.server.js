import { redirect } from '@sveltejs/kit'

/**
 * Admin layout server load function
 * Ensures user is authenticated before accessing admin routes
 */
export async function load({ locals }) {
  const session = await locals.getSession()

  if (!session) {
    throw redirect(303, '/login')
  }

  // Get user details from the users table
  const { data: userData } = await locals.supabase
    .from('users')
    .select('role, display_name')
    .eq('id', session.user.id)
    .single()

  return {
    session,
    user: userData
  }
}
