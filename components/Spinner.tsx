import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Reusable loading spinner component
 * Uses Lucide's Loader2 icon with Tailwind animations
 */
export function Spinner ({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <Loader2 className={`animate-spin text-primary ${sizeClasses[size]} ${className}`} />
  )
}

/**
 * Full page loading state with centered spinner
 */
export function PageLoader ({ message }: { message?: string }) {
  return (
    <div className='min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4'>
      <div className='relative'>
        <div className='absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse' />
        <Spinner size='lg' className='relative z-10' />
      </div>
      {message && (
        <p className='text-slate-500 font-medium animate-pulse'>{message}</p>
      )}
    </div>
  )
}
