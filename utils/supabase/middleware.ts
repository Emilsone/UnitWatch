// utils/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // 1. Initialize a generic response container
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // 2. Synchronize request cookies so server components can see them
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          
          // 3. Re-instantiate the response object to bundle the cookie payload
          supabaseResponse = NextResponse.next({
            request,
          })
          
          // 4. Bind the cookie payload to the response headers
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 5. Explicitly validate the user with Supabase
  const { data: { user } } = await supabase.auth.getUser()

  // 6. SAFE RE-ROUTING GATEWAY:
  // If the user is unauthenticated and hits a protected page, kick them back out
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  // If they are logged in, pass the active response with its cookies loaded
  return supabaseResponse
}
