import { cleanupStaleLessons } from '../jobs/cleanup'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Cleanup Cron Job
 * Deletes lessons that have isSaved = false and are older than 24 hours.
 * Also deletes the corresponding image from R2.
 */
export async function GET (request: Request) {
  // Guard the endpoint so only Vercel can invoke it via CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { deletedCount, deletedIds } = await cleanupStaleLessons()

    return NextResponse.json({
      success: true,
      deletedCount,
      deletedIds
    })
  } catch (error) {
    console.error('[Cleanup Cron] Error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
