import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'
import { useAuth } from '@clerk/nextjs'
import { useState, useEffect, useMemo } from 'react'

// The old createClient - can be kept if there are use cases for an unauthenticated client,
// or for a client where token is managed manually post-creation.
// For authenticated scenarios with Clerk, useSupabaseClient is preferred.
export const createBasicClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Missing Supabase environment variables for basic client')
    }
    return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// New hook for creating a Clerk-authenticated Supabase client
export const useSupabaseClient = (): SupabaseClient | null => {
    const { getToken, isSignedIn } = useAuth() // isSignedIn can help manage state
    const [client, setClient] = useState<SupabaseClient | null>(null)

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Define them here to include in dep array
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Memoize the getToken function wrapped for Supabase, to stabilize dependencies for useEffect
    const supabaseAccessTokenFactory = useMemo(() => {
        return async () => {
            // Only attempt to get token if signed in, though getToken itself handles this
            if (isSignedIn) {
                return await getToken({ template: 'supabase' })
            }
            return null
        }
    }, [getToken, isSignedIn])

    useEffect(() => {
        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Missing Supabase environment variables for authenticated client')
            setClient(null) // Ensure client is null if env vars are missing
            return
        }

        if (isSignedIn === undefined) { // Clerk still loading
            setClient(null)
            return
        }

        // We create the client once isSignedIn is determined (true or false)
        // If not signed in, accessTokenFactory will return null, giving an anon client.
        const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey, {
            global: {
                accessToken: supabaseAccessTokenFactory,
            },
        } as any) // Use 'as any' to bypass linter for accessToken
        setClient(supabase)

        // console.log("Supabase client initialized/updated with isSignedIn:", isSignedIn);

        // No cleanup needed for the client itself, but you could signOut or clear client if needed
        // return () => { /* client.auth.signOut(); */ }; 

    }, [supabaseUrl, supabaseAnonKey, supabaseAccessTokenFactory, isSignedIn]) // Add isSignedIn to dependencies

    return client
} 