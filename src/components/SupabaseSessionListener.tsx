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

      await fetch('/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ event, session }),
      })
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return null
}
