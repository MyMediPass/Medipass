'use client'

import { createContext, useContext, type ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { signOut } from '@/lib/auth'

type UserContextType = {
    user: User | null
    isAuthenticated: boolean
    signOut: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
    user: null,
    isAuthenticated: false,
    signOut: async () => { },
})

export function UserProvider({
    children,
    user
}: {
    children: ReactNode
    user: User | null
}) {
    return (
        <UserContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                signOut,
            }}
        >
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => useContext(UserContext) 