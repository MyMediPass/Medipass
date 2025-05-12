import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client'; // Assuming your tsconfig paths are set up for @/*
import { fileAnalysisRequested } from '@/inngest/functions'; // We'll create this next

// Create an API that serves all functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        fileAnalysisRequested, // Our function to handle file analysis
        // Add other functions here as needed
    ],
}); 