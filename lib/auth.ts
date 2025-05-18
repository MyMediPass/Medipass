'use server'

// import { createClient } from '@/lib/supabase/server' // No longer needed if signOut is refactored and other fns are done
import { redirect } from 'next/navigation'
// import { cookies } from 'next/headers' // No longer needed if createClient call is removed
import { currentUser, auth, clerkClient } from '@clerk/nextjs/server'; // Added clerkClient for potential future use

export async function getSession() {
    // const cookieStore = cookies() // Old Supabase related
    // const supabase = await createClient() // Old Supabase call
    // const { data: { session } } = await supabase.auth.getSession() // Old Supabase call
    const sessionInfo = await auth(); // Awaiting auth() based on linter feedback
    // auth() returns an object like { userId, sessionId, getToken, ... }. 
    // If a specific Supabase-like session object is needed, this might need adjustment
    // or use clerkClient.sessions.getSession(sessionInfo.sessionId) if sessionInfo.sessionId exists.
    // For now, returning the direct result of auth() which contains key session identifiers.
    return sessionInfo;
}

export async function requireAuth() { // Must be async due to awaiting auth()
    // const supabase = await createClient() // Old Supabase call
    // const { data: { user }, error } = await supabase.auth.getUser() // Old Supabase call

    const authResult = await auth(); // Awaiting auth() based on linter feedback

    if (!authResult.userId) {
        redirect('/login'); // Make sure this path is correct for your Clerk setup
    }

    return authResult; // Return the auth object which includes userId, orgId, etc.
}

export async function getUser() {
    // const supabase = await createClient() // Old Supabase call
    // const { data: { user } } = await supabase.auth.getUser() // Old Supabase call
    const user = await currentUser(); // Use Clerk's currentUser
    return user;
}

// This function's behavior changes significantly. 
// Clerk's primary sign-out is client-initiated.
// A server-side redirect alone won't sign the user out of their Clerk session.
// To truly sign out from server, you would need clerkClient.sessions.revokeSession(sessionId)
// which requires obtaining the sessionId from auth().
// For now, this will just be a redirect. Consider removing if not used or if client handles sign-out.
export async function signOut() {
    // const supabase = await createClient() // Old Supabase call
    // await supabase.auth.signOut() // Old Supabase call

    // Option 1: Just redirect. Client should handle actual sign out with Clerk.
    redirect('/login');

    // Option 2 (More complete server-side sign out, if needed):
    // const { sessionId } = await auth();
    // if (sessionId) {
    //   await clerkClient.sessions.revokeSession(sessionId);
    // }
    // redirect('/login');
} 