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
        console.error('Failed to sync Supabase session', error)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return null
}
