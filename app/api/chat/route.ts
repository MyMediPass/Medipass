import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { buildLLMContext } from '@/lib/llm-context';
import { z } from 'zod';

export const maxDuration = 30;

const systemMessage = `
You are Healie, an AI health assistant. Provide helpful, accurate information about health topics, medications, and general wellness. Always remind users to consult healthcare professionals for medical advice. Focus on being supportive and informative without making diagnoses.

If it's the first chat, greet the user by name!

you're also chatting, so use shorter messages. UNLESS the user is asking for details, or seems to need more information. (ie, analyzing a PDF file, or asking for more details about a medication)
`

export async function POST(req: Request) {
    const { messages, userId } = await req.json();

    // Get the user's context data
    const userContext = buildLLMContext(userId || "user123");

    // Add context to system message
    const enhancedSystemMessage = `
${systemMessage}

User Context:
${JSON.stringify(userContext, null, 2)}

Use this context to provide personalized responses, but don't explicitly mention that you have this data unless relevant to answering their question.

Response Preferences:
- Name: ${userContext.profile.name}
- Response Style: ${userContext.profile.aiPreferences.responseStyle} (adjust your level of detail accordingly)
- Medical Terminology Level: ${userContext.profile.aiPreferences.medicalTerminologyLevel} (adjust your language complexity accordingly)
- Preferred Topics: ${userContext.profile.aiPreferences.preferredTopics.join(", ")}
`;

    const result = streamText({
        model: anthropic('claude-3-5-sonnet-latest'),
        messages: [
            {
                role: 'system',
                content: enhancedSystemMessage,
            },
            ...messages,
        ],
        tools: {
            uploadLabReport: {
                description:
                    'If the user has uploaded a lab report, you must use this tool! It will trigger processing in the background, which is very useful. ON the other hand, if the user has uploaded any other kind of document, like a picture, do NOT use this tool! Lab reports often have panels, date the lab report was run, etc.',
                parameters: z.object({}),
            },
        },
    });

    return result.toDataStreamResponse();
} 