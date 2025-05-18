'use server'

import { redirect } from 'next/navigation'
import { currentUser, auth } from '@clerk/nextjs/server';

export async function getSession() {
    const sessionInfo = await auth();
    return sessionInfo;
}

export async function requireAuth() {
    const authResult = await auth();

    if (!authResult.userId) {
        redirect('/sign-in');
    }

    return authResult; // Return the auth object which includes userId, orgId, etc.
}

export async function getUser() {
    const user = await currentUser();
    return user;
}