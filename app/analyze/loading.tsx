import { PageLoader } from '@/components/Spinner'

/**
 * Loading state for analyze page
 * Shown automatically by Next.js while user preferences are being fetched
 */
export default function AnalyzeLoading () {
  return <PageLoader message='Preparing...' />
}
