import { PageLoader } from '@/components/Spinner'

/**
 * Loading state for results page
 * Shown automatically by Next.js while lesson data is being fetched
 */
export default function ResultsLoading () {
  return <PageLoader message='Loading results...' />
}
