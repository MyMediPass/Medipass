import { createClient } from "@supabase/supabase-js"

// Re-export createClient for modules that need it directly
export { createClient }

// Types for better type safety
type SupabaseClient = ReturnType<typeof createClient>

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// Use the site URL from environment or fallback to the Vercel deployment URL
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mymedipass.vercel.app"

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
        detectSessionInUrl: true, // Let Supabase detect the code in URLs
        flowType: "pkce",
      },
    })
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true, // Let Supabase detect the code in URLs
      flowType: "pkce",
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
      detectSessionInUrl: true, // Let Supabase detect the code in URLs
      flowType: "pkce",
    },
  })
  return clientSupabaseClient
}

// For server-side operations requiring elevated privileges (e.g., API routes)
// This client uses the service role key and should only be used in secure server environments.
// Ensure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables.
let serviceRoleClient: SupabaseClient | null = null;

export const createSupabaseServiceRoleClient = () => {
  if (serviceRoleClient) {
    return serviceRoleClient;
  }
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.');
  }
  serviceRoleClient = createClient(supabaseUrl, serviceKey, {
    auth: {
      // For service roles, session persistence is typically not needed/relevant in the same way.
      // Setting autoRefreshToken and persistSession to false is common.
      autoRefreshToken: false,
      persistSession: false,
      // detectSessionInUrl is not relevant for service role
    }
  });
  return serviceRoleClient;
};
