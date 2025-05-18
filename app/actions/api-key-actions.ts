"use server"

import { revalidatePath } from "next/cache"
// import { cookies } from "next/headers"; // Not directly needed if createServerSupabaseClient handles it
// import { createServerSupabaseClient } from "@/lib/supabase"; // Old import
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server"; // New import for Clerk-aware client
import { auth } from "@clerk/nextjs/server"; // For Clerk auth

// Function to validate if a user is an admin
async function validateAdmin() {
  // const cookieStore = cookies(); // Not directly needed here now
  const { userId } = await auth(); // Get userId from Clerk

  if (!userId) {
    throw new Error("Unauthorized: You must be logged in");
  }

  const supabase = await createServerSupabaseClient(); // Use the Clerk-aware client

  // Get user role from the database
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId) // Use Clerk's userId
    .single();

  if (profileError || !profile) {
    throw new Error("Unauthorized: Unable to verify user role");
  }

  if (profile.role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return userId; // Return Clerk userId
}

// Function to test if an API key is valid
export async function testApiKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  // ... (no auth changes here, this is an external API call)
  try {
    // Simple test request to the Groq API
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      return { valid: true, message: "API key is valid" };
    } else {
      const error = await response.json();
      return {
        valid: false,
        message: `API key validation failed: ${error.error?.message || response.statusText}`,
      };
    }
  } catch (error) {
    console.error("Error testing API key:", error);
    return {
      valid: false,
      message: "Error testing API key. Please check your internet connection and try again.",
    };
  }
}

// Function to update the API key in the database
export async function updateApiKey(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const userId = await validateAdmin();
    const apiKey = formData.get("apiKey") as string;

    if (!apiKey || apiKey.trim() === "") {
      return { success: false, message: "API key cannot be empty" };
    }

    const testResult = await testApiKey(apiKey);
    if (!testResult.valid) {
      return { success: false, message: testResult.message };
    }

    // Get Supabase client - use the Clerk-aware one
    // const cookieStore = cookies(); // Not needed if createServerSupabaseClient is self-contained
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.from("settings").upsert({
      key: "xai_api_key",
      value: apiKey,
      updated_by: userId, // userId from validateAdmin (Clerk's ID)
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error updating API key:", error);
      return { success: false, message: `Failed to update API key: ${error.message}` };
    }

    revalidatePath("/admin/settings");
    return { success: true, message: "API key updated successfully" };
  } catch (error) {
    console.error("Error in updateApiKey:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An unknown error occurred",
    };
  }
}

// Function to get the current API key status (not the actual key)
export async function getApiKeyStatus(): Promise<{ exists: boolean; lastUpdated: string | null }> {
  try {
    await validateAdmin();

    // Get Supabase client - use the Clerk-aware one
    // const cookieStore = cookies(); // Not needed
    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.from("settings").select("updated_at").eq("key", "xai_api_key").single();

    if (error && error.code !== "PGRST116") {
      console.error("Error getting API key status:", error);
      throw new Error(`Failed to get API key status: ${error.message}`);
    }

    return {
      exists: !!data,
      lastUpdated: data ? data.updated_at : null,
    };
  } catch (error) {
    console.error("Error in getApiKeyStatus:", error);
    throw error;
  }
}
