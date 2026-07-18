import './globals.css'
import Head from 'next/head'

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
      <body style={{overflowX:'hidden'}}>{children}</body>
    </html>
    </>
  )
}
