import { NextRequest, NextResponse } from 'next/server'
import { fetchSearchConsoleData } from '@/lib/google/search-console'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') ?? '30', 10)

    if (days < 1 || days > 90) {
      return NextResponse.json({ error: 'Days must be between 1 and 90' }, { status: 400 })
    }

    const data = await fetchSearchConsoleData(days)

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error('[API] Search Console error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
