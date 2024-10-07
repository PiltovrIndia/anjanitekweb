import { Inter } from 'next/font/google'
import './globals.css'
import Head from 'next/head'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Anjani Tek',
  description: 'Dealer Management!',
}

export default function RootLayout({ children }) {
  return (
    <>
    <Head>
      <link rel='icon' href='/anjanitek.ico' />
    </Head>
    <html lang="en" style={{overflowX:'hidden'}}>
      <body className={inter.className}  style={{overflowX:'hidden'}}>{children}</body>
    </html>
    </>
  )
}
