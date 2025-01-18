
import './globals.css'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export const metadata = {
  title: 'Protocol App',
  description: 'Personalized Protocol Generator',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies })

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
