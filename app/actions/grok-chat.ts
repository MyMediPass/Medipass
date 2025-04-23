"use server"

import { cookies } from "next/headers"
import { createServerSupabaseClient } from "@/lib/supabase"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

export async function sendMessageToGrok(
  messages: Message[],
  attachmentDescriptions: string[] = [],
): Promise<{ content: string; error?: string }> {
  try {
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
      console.log("API key not found in database, using offline mode")
      return simulateAIResponse(messages)
    }

    // Add attachment descriptions to the last user message if any exist
    if (attachmentDescriptions.length > 0 && messages.length > 0) {
      const lastUserMessageIndex = messages.findIndex((m) => m.role === "user")
      if (lastUserMessageIndex !== -1) {
        const attachmentText = "\n\n[Attached files: " + attachmentDescriptions.join(", ") + "]"
        messages[lastUserMessageIndex].content += attachmentText
      }
    }

    // Add a system message if one doesn't exist
    if (!messages.some((m) => m.role === "system")) {
      messages.unshift({
        role: "system",
        content:
          "You are Healie, an AI health assistant. Provide helpful, accurate information about health topics, medications, and general wellness. Always remind users to consult healthcare professionals for medical advice. Focus on being supportive and informative without making diagnoses.",
      })
    }

    // For debugging - log that we're about to call the API (but don't log the full messages for privacy)
    console.log("Calling AI API with", messages.length, "messages")

    // Call Grok API
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
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Grok API error:", errorData)
      return {
        content: "",
        error: `Error communicating with AI: ${errorData.error?.message || response.statusText}`,
      }
    }

    const data = await response.json()
    return { content: data.choices[0].message.content }
  } catch (error) {
    console.error("Error in sendMessageToGrok:", error)
    return {
      content: "",
      error: "Failed to communicate with AI service. Please try again later.",
    }
  }
}

// Function to simulate AI responses while API key issues are being resolved
function simulateAIResponse(messages: Message[]): { content: string } {
  // Get the last user message
  const lastUserMessage = messages.filter((m) => m.role === "user").pop()
  const userQuery = lastUserMessage?.content.toLowerCase() || ""

  // Generate appropriate responses based on common health queries
  if (userQuery.includes("medication") || userQuery.includes("medicine") || userQuery.includes("pill")) {
    return {
      content:
        "It's important to take your medications as prescribed by your doctor. I notice you have Lisinopril, Atorvastatin, and Metformin on your schedule. Remember to take them at the specified times and with food when indicated. If you're experiencing any side effects, please consult your healthcare provider before making any changes to your medication routine.",
    }
  } else if (userQuery.includes("appointment") || userQuery.includes("doctor") || userQuery.includes("visit")) {
    return {
      content:
        "I can see you have upcoming appointments with Dr. Sarah Johnson (Primary Care) on April 20, 2025, and Dr. Michael Chen (Cardiology) on May 15, 2025. Would you like me to remind you about these appointments as they get closer? Remember to prepare any questions you might have for your doctors before the visits.",
    }
  } else if (userQuery.includes("blood pressure") || userQuery.includes("hypertension")) {
    return {
      content:
        "Maintaining healthy blood pressure is important. The Lisinopril you're taking helps with blood pressure control. Normal blood pressure is generally considered to be below 120/80 mmHg. Remember to monitor your blood pressure regularly and keep a log to share with your doctor. Lifestyle factors like reducing sodium intake, regular exercise, and stress management can also help manage blood pressure.",
    }
  } else if (userQuery.includes("diabetes") || userQuery.includes("blood sugar") || userQuery.includes("glucose")) {
    return {
      content:
        "I see you're taking Metformin, which is commonly used to manage blood sugar levels in people with type 2 diabetes. It's important to monitor your blood glucose regularly and follow your doctor's recommendations for diet and exercise. Aim to keep your blood sugar levels within the target range your doctor has set for you.",
    }
  } else if (userQuery.includes("cholesterol") || userQuery.includes("lipid")) {
    return {
      content:
        'Atorvastatin helps lower cholesterol levels. For optimal heart health, it\'s recommended to maintain total cholesterol below 200 mg/dL, with LDL ("bad" cholesterol) below 100 mg/dL and HDL ("good" cholesterol) above 60 mg/dL. A heart-healthy diet low in saturated fats and regular exercise can also help manage cholesterol levels.',
    }
  } else if (userQuery.includes("side effect") || userQuery.includes("reaction")) {
    return {
      content:
        "If you're experiencing potential side effects from your medications, it's important to consult your healthcare provider before making any changes to your regimen. Common side effects of Lisinopril may include dizziness or a dry cough; Atorvastatin might cause muscle aches; and Metformin sometimes causes digestive issues. Your doctor can help determine if these symptoms are related to your medications and suggest appropriate adjustments if needed.",
    }
  } else if (userQuery.includes("diet") || userQuery.includes("nutrition") || userQuery.includes("food")) {
    return {
      content:
        "A balanced diet is crucial for managing your health conditions. Based on your medications, you might benefit from a diet low in sodium (for blood pressure), low in saturated fats (for cholesterol), and with controlled carbohydrate intake (for blood sugar). The Mediterranean diet or DASH diet might be beneficial for you. Consider consulting with a registered dietitian for personalized nutrition advice.",
    }
  } else if (userQuery.includes("exercise") || userQuery.includes("activity") || userQuery.includes("workout")) {
    return {
      content:
        "Regular physical activity is beneficial for managing blood pressure, cholesterol, and blood sugar levels. Aim for at least 150 minutes of moderate-intensity exercise per week, such as brisk walking, swimming, or cycling. Always start slowly and gradually increase intensity, especially if you haven't been active recently. Check with your doctor about any specific exercise restrictions based on your health conditions.",
    }
  } else {
    return {
      content:
        "Thank you for your question. As your health assistant, I'm here to provide general information about your health, medications, and appointments. However, I'm currently operating in offline mode due to a connection issue with my knowledge base. I can still help with basic information about your medications (Lisinopril, Atorvastatin, and Metformin) and your upcoming appointments. For more specific health advice, please consult your healthcare provider.",
    }
  }
}
