import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Simple password-based authentication
// In production, use proper authentication service
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

export async function POST(request) {
  try {
    const { password } = await request.json()

    if (password === ADMIN_PASSWORD) {
      // Set authentication cookie
      const cookieStore = cookies()
      cookieStore.set('admin_auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })

      return NextResponse.json({ success: true, message: 'Logged in successfully' })
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const cookieStore = cookies()
    const authCookie = cookieStore.get('admin_auth')

    if (authCookie?.value === 'true') {
      return NextResponse.json({ authenticated: true })
    } else {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  try {
    // Clear authentication cookie
    const cookieStore = cookies()
    cookieStore.set('admin_auth', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    return NextResponse.json({ success: true, message: 'Logged out successfully' })
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    )
  }
}
