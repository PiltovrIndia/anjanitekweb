'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Biscuits from 'universal-cookie'

import { AppSidebar } from '@/app/components/app-sidebar'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/app/components/ui/sidebar'
import { Toaster } from '@/app/components/ui/toaster'

const biscuits = new Biscuits()

export default function CampusLayout({ children }) {
  const router = useRouter()
  const [userData, setUserData] = useState(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const cookieValue = biscuits.get('sc_user_detail')

    if (!cookieValue) {
      router.replace('/')
      return
    }

    try {
      const parsedUser = JSON.parse(decodeURIComponent(cookieValue))
      setUserData(parsedUser)
      setIsReady(true)
    } catch {
      biscuits.remove('sc_user_detail', { path: '/' })
      router.replace('/')
    }
  }, [router])

  const showSidebar = userData?.role && userData.role !== 'Student'

  if (!isReady || !userData) {
    return null
  }

  return (
    <SidebarProvider defaultOpen>
      {showSidebar ? <AppSidebar userData={userData} /> : null}
      <SidebarInset>
        <div className='flex flex-1 flex-col overflow-hidden px-4 py-4 md:px-6 md:py-6'>
          {showSidebar ? (
            <div className='campus-sidebar-toggle'>
              <SidebarTrigger />
            </div>
          ) : null}
          <div className='campus-page-content contents'>{children}</div>
          <Toaster />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
