/**
 * Root layout server load function
 * Provides session data to all pages
 */
export async function load({ locals }) {
  const session = await locals.getSession()

  return {
    session
  }
}
