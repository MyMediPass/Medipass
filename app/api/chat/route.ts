import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';

export const maxDuration = 30;

const systemMessage = "You are Healie, an AI health assistant. Provide helpful, accurate information about health topics, medications, and general wellness. Always remind users to consult healthcare professionals for medical advice. Focus on being supportive and informative without making diagnoses."

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: anthropic('claude-3-5-sonnet-latest'),
        messages: [
            {
                role: 'system',
                content: systemMessage,
            },
            ...messages,
        ],
    });

    return result.toDataStreamResponse();
} 