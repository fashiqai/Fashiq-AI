import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake can make it very hard to debug
  // auth issues.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = new URL(request.nextUrl.href)

  // Redirect Logic
  // 1. If hitting root and logged in, check profile
  if (user) {
    if (url.pathname === '/' || url.pathname === '/login') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('business_type')
        .eq('id', user.id)
        .single()

      if (profile?.business_type) {
        return NextResponse.redirect(new URL(`/studio/${profile.business_type}`, request.url))
      } else {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
    }
  }

  // 2. Protect Studio & Onboarding pages
  if (!user && (url.pathname.startsWith('/studio') || url.pathname === '/onboarding')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return supabaseResponse
}
