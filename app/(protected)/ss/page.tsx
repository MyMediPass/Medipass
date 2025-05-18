import { currentUser } from '@clerk/nextjs/server'; // Import Clerk's currentUser
// import { createClient } from "@/lib/supabase/server"; // No longer needed for auth

export default async function SS() {
    // const supabase = await createClient(); // No longer needed for auth
    // const { data, error } = await supabase.auth.getUser(); // Old Supabase auth call

    const user = await currentUser(); // Get user from Clerk

    if (user) {
        console.log(user); // Log Clerk user object
    } else {
        console.log("No user found by Clerk currentUser()");
        // This case should ideally be handled by Clerk middleware for protected pages,
        // redirecting to sign-in if no user.
    }

    // if (error) { // Error handling will be different with Clerk
    //     console.log(error);
    // }

    return <div>SS (Protected Page using Clerk Auth)</div>;
}