import { cleanupStaleLessons } from './jobs/cleanup'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Primary cron endpoint invoked by Vercel once per day.
 * Currently runs the cleanup job and can be extended with more tasks later.
 */
export async function GET (request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const cleanupResult = await cleanupStaleLessons()

    return NextResponse.json({
      ok: true,
      cleanup: cleanupResult
    })
  } catch (error) {
    console.error('[Cron] Error running scheduled tasks:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
