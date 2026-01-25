import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@moneyapp.com'
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456'

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      )
    }

    // Create a Supabase client with anon key for authentication
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Try to sign in as admin
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    })

    if (error) {
      // If admin doesn't exist, return helpful error
      return NextResponse.json(
        { 
          error: 'Admin user not found. Please create admin user in Supabase first. See ADMIN_SETUP.md for instructions.',
          details: error.message 
        },
        { status: 404 }
      )
    }

    if (!data.session) {
      return NextResponse.json(
        { error: 'Failed to create admin session' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      },
      user: data.user,
    })
  } catch (error: any) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: error.message || 'Admin login failed' },
      { status: 500 }
    )
  }
}

