import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/onboarding'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Use request.nextUrl.clone() to safely construct the redirect URL on Vercel
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = next
      redirectUrl.searchParams.delete('code')
      redirectUrl.searchParams.delete('next')
      return NextResponse.redirect(redirectUrl)
    } else {
      console.error("Auth Callback Error:", error.message)
    }
  }

  // If there's no code or there was an error
  const errorUrl = request.nextUrl.clone()
  errorUrl.pathname = '/login'
  errorUrl.searchParams.set('error', 'auth-failed')
  return NextResponse.redirect(errorUrl)
}
