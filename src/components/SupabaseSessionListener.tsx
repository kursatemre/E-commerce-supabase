'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SupabaseSessionListener() {
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!event) {
        return
      }

      const shouldSync = event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED'
      if (!shouldSync) {
        return
      }

      if (!session && event !== 'SIGNED_OUT') {
        return
      }

      try {
        await fetch('/auth/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ event, session }),
        })
      } catch (error) {
        console.warn('Supabase oturum eşitlemesi başarısız oldu', error)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return null
}
