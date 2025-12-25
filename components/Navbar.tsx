'use client'

import { useState } from 'react'
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useI18n } from '@/lib/i18n/use-i18n'
import { LanguageSwitcher } from './LanguageSwitcher'
import { Menu, X } from 'lucide-react'

export function Navbar () {
  const { messages } = useI18n()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <nav className='h-16 border-b bg-white sticky top-0 z-50'>
      <div className='h-full flex items-center justify-between px-4 md:px-6'>
        {/* Logo */}
        <Link href='/' className='text-xl font-bold text-primary tracking-tight'>
          {messages.nav.appName}
        </Link>

        {/* Desktop Navigation */}
        <SignedIn>
          <div className='hidden md:flex items-center gap-6'>
            <Link href='/analyze' className='text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors'>
              {messages.nav.analyze}
            </Link>
            <Link href='/history' className='text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors'>
              {messages.nav.history}
            </Link>
          </div>
        </SignedIn>

        {/* Right side actions */}
        <div className='flex items-center gap-2 md:gap-3'>
          <LanguageSwitcher />
          <SignedIn>
            <UserButton />
            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className='md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors'
              aria-label='Toggle menu'
            >
              {isMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
            </button>
          </SignedIn>
          <SignedOut>
            <SignInButton mode='modal'>
              <button className='bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-all active:scale-95'>
                {messages.nav.signIn}
              </button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <SignedIn>
        {isMenuOpen && (
          <div className='md:hidden absolute top-16 left-0 right-0 bg-white border-b shadow-lg animate-in slide-in-from-top-2 duration-200'>
            <div className='flex flex-col p-4 gap-2'>
              <Link
                href='/analyze'
                onClick={closeMenu}
                className='px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors'
              >
                {messages.nav.analyze}
              </Link>
              <Link
                href='/history'
                onClick={closeMenu}
                className='px-4 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors'
              >
                {messages.nav.history}
              </Link>
            </div>
          </div>
        )}
      </SignedIn>
    </nav>
  )
}
