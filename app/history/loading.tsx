import { PageLoader } from '@/components/Spinner'

/**
 * Loading state for history page
 * Shown automatically by Next.js while the page data is being fetched
 */
export default function HistoryLoading () {
  return <PageLoader message='Loading your lessons...' />
}
