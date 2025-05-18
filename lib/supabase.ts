import { createClient } from "@supabase/supabase-js"

// Re-export createClient for modules that need it directly (though using specific wrappers is often better)
export { createClient as originalSupabaseCreateClient }

// Types for better type safety
type SupabaseClient = ReturnType<typeof createClient>

// Environment variables (only needed for createSupabaseServiceRoleClient now)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; // Not used by service role client

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
  // Service role client does not use anon key in its direct constructor call here
  serviceRoleClient = createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    }
  });
  return serviceRoleClient;
};
