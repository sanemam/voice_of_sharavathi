import { cookies } from 'next/headers'

export async function checkAuth() {
  try {
    const cookieStore = cookies()
    const authCookie = cookieStore.get('admin_auth')
    return authCookie?.value === 'true'
  } catch (error) {
    return false
  }
}

export async function requireAuth() {
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    // In Next.js 13+ app router, we can't redirect from server components
    // This function should be used in API routes or server actions
    throw new Error('Authentication required')
  }

  return true
}
