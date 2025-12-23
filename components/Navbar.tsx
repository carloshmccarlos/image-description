import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'

export function Navbar() {
    return (
        <nav className='h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-50'>
            <div className='flex items-center gap-8'>
                <Link href='/' className='text-xl font-bold text-primary tracking-tight'>
                    LexiLens
                </Link>
                <SignedIn>
                    <div className='hidden md:flex items-center gap-6'>
                        <Link href='/analyze' className='text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors'>
                            Analyze
                        </Link>
                        <Link href='/history' className='text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors'>
                            History
                        </Link>
                    </div>
                </SignedIn>
            </div>
            <div>
                <SignedIn>
                    <UserButton />
                </SignedIn>
                <SignedOut>
                    <SignInButton mode='modal'>
                        <button className='bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all active:scale-95'>
                            Sign In
                        </button>
                    </SignInButton>
                </SignedOut>
            </div>
        </nav>
    )
}
