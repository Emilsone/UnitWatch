export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    
    // 1. Exchange the code for a session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      const user = data.user;
      
      // 2. Detect if the user is brand new or returning
      const isNewUser = user.created_at === user.updated_at;
      
      // 3. Add a custom tag to the URL destination string
      const destinationPath = isNewUser 
        ? '/dashboard?toast=welcome-new' 
        : '/dashboard?toast=welcome-back';
        
      return NextResponse.redirect(`${origin}${destinationPath}`)
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=auth-failed`)
}
