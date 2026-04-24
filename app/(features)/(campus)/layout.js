'use client'

import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import Biscuits from 'universal-cookie'

import { AppSidebar } from '@/app/components/app-sidebar'
import { Separator } from '@/app/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/app/components/ui/sidebar'
import { Toaster } from '@/app/components/ui/toaster'

const biscuits = new Biscuits()

const PAGE_TITLES = {
  '/appreports': 'App Reports',
  '/confirmations': 'Confirmations',
  '/dashboard': 'Dashboard',
  '/dashboard2': 'Dealer Requests',
  '/dealers': 'Dealers',
  '/feed': 'Feed',
  '/forecast': 'Forecast',
  '/invoices': 'Invoices',
  '/ledger': 'Ledger Import',
  '/manageimages': 'Manage Images',
  '/messages': 'Messages',
  '/offers': 'Offers',
  '/productsv2': 'Designs',
  '/registration/form': 'Registration',
  '/sales': 'Sales',
  '/targets': 'Targets',
}

function formatSegment(segment = '') {
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]

  const segments = pathname.split('/').filter(Boolean)
  return formatSegment(segments[segments.length - 1] || 'Workspace')
}

export default function CampusLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const cookieValue = biscuits.get('sc_user_detail')

    if (!cookieValue) {
      router.replace('/')
      setIsReady(true)
      return
    }

    try {
      const parsedUser = JSON.parse(decodeURIComponent(cookieValue))
      setUserData(parsedUser)
    } catch {
      biscuits.remove('sc_user_detail', { path: '/' })
      router.replace('/')
    } finally {
      setIsReady(true)
    }
  }, [router])

  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname])
  const showSidebar = userData?.role && userData.role !== 'Student'

  if (!isReady) {
    return null
  }

  return (
    <SidebarProvider defaultOpen>
      {showSidebar ? <AppSidebar userData={userData} /> : null}
      <SidebarInset>
        <header className='sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:px-6'>
          {showSidebar ? <SidebarTrigger className='-ml-1' /> : null}
          {showSidebar ? <Separator orientation='vertical' className='h-4' /> : null}
          <div className='flex min-w-0 items-center gap-3'>
            <div className='relative size-9 overflow-hidden rounded-xl border bg-card'>
              <Image src='/anjani_logo.webp' alt='Anjani Tek' fill className='object-cover' sizes='36px' priority />
            </div>
            <div className='min-w-0'>
              <p className='truncate text-sm font-semibold leading-none'>Anjani Tek</p>
              <p className='truncate pt-1 text-xs text-muted-foreground'>{pageTitle}</p>
            </div>
          </div>
          {userData ? (
            <div className='ml-auto hidden min-w-0 text-right md:block'>
              <p className='truncate text-sm font-medium'>{userData.name}</p>
              <p className='truncate text-xs text-muted-foreground'>{userData.role}</p>
            </div>
          ) : null}
        </header>
        <div className='flex flex-1 flex-col overflow-hidden px-4 py-4 md:px-6 md:py-6'>
          {children}
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
  