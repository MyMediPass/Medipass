import { createServerSupabaseClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { StreamingTextResponse, type Message } from "ai"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { messages, attachmentDescriptions = [] } = await req.json()

    // Get the API key from the database
    const cookieStore = cookies()
    const supabase = createServerSupabaseClient(cookieStore)

    const { data: apiKeyData, error: apiKeyError } = await supabase
      .from("settings")
      .select("value")
      .eq("key", "xai_api_key")
      .single()

    const apiKey = apiKeyData?.value

    // Check if API key is available
    if (apiKeyError || !apiKey) {
      // Instead of returning an error, return a simulated response
      const userMessage = messages[messages.length - 1].content
      const simulatedResponse = generateOfflineResponse(userMessage, messages)

      return new Response(simulatedResponse, {
        headers: {
          "Content-Type": "text/plain",
          "X-Offline-Mode": "true",
        },
      })
    }

    // Add a system message if one doesn't exist
    if (!messages.some((m: Message) => m.role === "system")) {
      messages.unshift({
        role: "system",
        content:
          "You are Healie, an AI health assistant. Provide helpful, accurate information about health topics, medications, and general wellness. Always remind users to consult healthcare professionals for medical advice. Focus on being supportive and informative without making diagnoses.",
      })
    }

    // Add attachment descriptions to the last user message if any exist
    if (attachmentDescriptions.length > 0) {
      const lastUserMessageIndex = messages.findIndex((m: Message) => m.role === "user")
      if (lastUserMessageIndex !== -1) {
        const attachmentText = "\n\n[Attached files: " + attachmentDescriptions.join(", ") + "]"
        messages[lastUserMessageIndex].content += attachmentText
      }
    }

    // Call Grok API with streaming
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages,
        temperature: 0.7,
        max_tokens: 1024,
        stream: true,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return Response.json(
        { error: `Error from Grok API: ${error.error?.message || response.statusText}` },
        { status: response.status },
      )
    }

    // Return a streaming response
    return new StreamingTextResponse(response.body)
  } catch (error: any) {
    console.error("Error in chat API route:", error)
    return Response.json({ error: `Failed to communicate with AI service: ${error.message}` }, { status: 500 })
  }
}

// Function to generate offline responses based on user input
function generateOfflineResponse(userMessage: string, messages: Message[]): string {
  const lowerCaseMessage = userMessage.toLowerCase()

  // Check for medication-related queries
  if (
    lowerCaseMessage.includes("medication") ||
    lowerCaseMessage.includes("medicine") ||
    lowerCaseMessage.includes("pill") ||
    lowerCaseMessage.includes("drug") ||
    lowerCaseMessage.includes("lisinopril") ||
    lowerCaseMessage.includes("atorvastatin") ||
    lowerCaseMessage.includes("metformin")
  ) {
    return "I see you're asking about medications. In offline mode, I can tell you that your current medications are Lisinopril (10mg), Atorvastatin (20mg), and Metformin (500mg). Remember to take them as prescribed and consult your doctor before making any changes to your medication regimen."
  }

  // Check for appointment-related queries
  if (
    lowerCaseMessage.includes("appointment") ||
    lowerCaseMessage.includes("doctor") ||
    lowerCaseMessage.includes("visit") ||
    lowerCaseMessage.includes("schedule") ||
    lowerCaseMessage.includes("meeting")
  ) {
    return "Regarding appointments, you have two upcoming visits: Dr. Sarah Johnson (Primary Care) on April 20, 2025, at 10:00 AM at Cityview Medical Center, and Dr. Michael Chen (Cardiology) on May 15, 2025, at 2:30 PM at Heart Health Specialists."
  }

  // Check for health-related queries
  if (
    lowerCaseMessage.includes("health") ||
    lowerCaseMessage.includes("wellness") ||
    lowerCaseMessage.includes("feeling") ||
    lowerCaseMessage.includes("symptom") ||
    lowerCaseMessage.includes("pain") ||
    lowerCaseMessage.includes("sick")
  ) {
    return "I'm currently in offline mode with limited capabilities. For health concerns, I recommend keeping track of your symptoms and discussing them with your healthcare provider at your next appointment. If you're experiencing severe symptoms, please contact your doctor or seek emergency care immediately."
  }

  // Default response
  return "I'm currently running in offline mode with limited capabilities. I can provide basic information about your medications and appointments, but for more detailed health information, please check back when online mode is available or consult your healthcare provider."
}
