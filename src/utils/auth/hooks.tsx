"use client"

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LoginSession } from './auth'

type useChronalogSessionProps = {
  redirectTo?: string
  redirectIfFound?: boolean
}

type useChronalogSessionReturn = {
  session: LoginSession | null
  status: 'loading' | 'unauthenticated' | 'authenticated'
}

export const useChronalogSession = ({
  redirectTo,
  redirectIfFound
}: useChronalogSessionProps = {}): useChronalogSessionReturn => {
  const router = useRouter()

  const { data, error, isLoading } = useQuery({
    queryKey: ['chronalog-session'],
    queryFn: async (): Promise<{ session: LoginSession } | null> => {
      const response = await fetch('/api/changelog/auth/user')
      if (!response.ok) {
        throw new Error('Failed to fetch user session')
      }
      const data = await response.json()
      return data || null
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false
  })

  const session = data?.session as LoginSession
  const hasUser = Boolean(session)

  useEffect(() => {
    if (!redirectTo || isLoading) return

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !hasUser) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && hasUser)
    ) {
      router.push(redirectTo)
    }
  }, [redirectTo, redirectIfFound, isLoading, hasUser, router])

  if (isLoading) {
    return {
      session: null,
      status: 'loading'
    }
  }

  if ((data && !hasUser) || error) {
    return {
      session: null,
      status: 'unauthenticated'
    }
  }

  return {
    session,
    status: 'authenticated'
  }
}

export function useChronalogSignOut() {
  const router = useRouter()

  const signOut = () => {
    router.push('/api/changelog/auth/signout')
  }

  return { signOut }
}
