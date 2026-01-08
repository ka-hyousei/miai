'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { HeartbeatProvider } from './HeartbeatProvider'

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <HeartbeatProvider>{children}</HeartbeatProvider>
    </NextAuthSessionProvider>
  )
}
