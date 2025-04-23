import { createClient } from "@supabase/supabase-js"

// Re-export createClient for modules that need it directly
export { createClient }

// Types for better type safety
type SupabaseClient = ReturnType<typeof createClient>

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// Use the site URL from environment or fallback to localhost for development
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

// For server components
export const createServerSupabaseClient = (cookieStore?: any) => {
  if (cookieStore) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        // Use the site URL from environment
        redirectTo: `${siteUrl}/auth/confirm`,
      },
    })
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      // Use the site URL from environment
      redirectTo: `${siteUrl}/auth/confirm`,
    },
  })
}

// For client components (singleton pattern to prevent multiple instances)
let clientSupabaseClient: SupabaseClient | null = null

export const createClientSupabaseClient = () => {
  if (clientSupabaseClient) return clientSupabaseClient

  clientSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: "pkce",
      // Use the site URL from environment
      redirectTo: `${siteUrl}/auth/confirm`,
    },
  })
  return clientSupabaseClient
}
