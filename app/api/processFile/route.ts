import { NextRequest, NextResponse } from 'next/server'
import { init } from '@instantdb/admin'
import OpenAI from 'openai'
import schema from '@/instant.schema'
import { pdfAnalysisPrompt } from './pdfAnalysisPrompt'

// Initialize InstantDB admin client
const db = init({
    appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID!,
    adminToken: process.env.INSTANT_ADMIN_TOKEN!,
    schema,
})

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
})

// Helper function to create a file with the OpenAI Files API
async function createOpenAIFile(fileUrl: string): Promise<string> {
    try {
        // Fetch the file from the URL
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const fileBuffer = await response.arrayBuffer();
        const file = new File([fileBuffer], 'image.jpg', { type: 'image/jpeg' });

        const result = await openai.files.create({
            file: file,
            purpose: "vision",
        });

        return result.id;
    } catch (error) {
        console.error('Error creating OpenAI file:', error);
        throw new Error('Failed to upload file to OpenAI');
    }
}

// Helper function to analyze images using the new OpenAI API format
async function analyzeImageWithAI(fileUrl: string): Promise<{ summary: string; transcription: string }> {
    try {
        // First, upload the file to OpenAI
        const fileId = await createOpenAIFile(fileUrl);

        const response = await openai.responses.create({
            model: "gpt-4.1-mini",
            input: [
                {
                    role: "user",
                    content: [
                        {
                            type: "input_text",
                            text: "Analyze this medical lab report image. Provide a detailed summary of the findings, test results, and any notable values. Also provide a complete transcription of all text visible in the image. Return your response in JSON format with 'summary' and 'transcription' fields."
                        },
                        {
                            type: "input_image",
                            file_id: fileId,
                            detail: "high",
                        },
                    ],
                }
            ],
        });

        const content = response.output_text;

        if (!content) {
            throw new Error('No response from OpenAI');
        }

        // Try to parse JSON response, fallback to plain text
        try {
            const parsed = JSON.parse(content);
            return {
                summary: parsed.summary || content,
                transcription: parsed.transcription || ''
            };
        } catch {
            return {
                summary: content,
                transcription: 'Transcription not available'
            };
        }
    } catch (error) {
        console.error('Image analysis error:', error);
        throw new Error('Failed to analyze image with AI');
    }
}

// Helper function to create a file with the OpenAI Files API for documents
async function createOpenAIDocumentFile(fileUrl: string): Promise<string> {
    try {
        // Fetch the file from the URL
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.statusText}`);
        }

        const fileBuffer = await response.arrayBuffer();
        const file = new File([fileBuffer], 'document.pdf', { type: 'application/pdf' });

        const result = await openai.files.create({
            file: file,
            purpose: "user_data",
        });

        return result.id;
    } catch (error) {
        console.error('Error creating OpenAI document file:', error);
        throw new Error('Failed to upload document to OpenAI');
    }
}

// Helper function to analyze documents using the responses API
async function analyzeDocumentWithAI(fileUrl: string, fileName: string): Promise<{ summary: string; transcription: string }> {
    try {
        // First, upload the file to OpenAI
        const fileId = await createOpenAIDocumentFile(fileUrl);

        const response = await openai.responses.create({
            model: "gpt-4.1",
            input: [
                {
                    role: "user",
                    content: [
                        {
                            type: "input_file",
                            file_id: fileId,
                        },
                        {
                            type: "input_text",
                            text: pdfAnalysisPrompt,
                        },
                    ],
                }
            ],
        });

        const content = response.output_text;

        if (!content) {
            throw new Error('No response from OpenAI');
        }

        // Try to parse JSON response, fallback to plain text
        try {
            const parsed = JSON.parse(content);
            return {
                summary: parsed.summary || content,
                transcription: parsed.transcription || ''
            };
        } catch {
            return {
                summary: content,
                transcription: 'Document analysis completed'
            };
        }
    } catch (error) {
        console.error('Document analysis error:', error);
        throw new Error('Failed to analyze document with AI');
    }
}

// Helper function to determine if a file is an image
function isImageFile(fileName: string): boolean {
    return /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(fileName);
}

// Helper function to update lab report status
async function updateLabReportStatus(labReportId: string, status: string, additionalData?: Record<string, any>) {
    await db.transact(
        db.tx.labReports[labReportId].update({
            status,
            ...(additionalData || {}),
        })
    );
}

export async function POST(request: NextRequest) {
    try {
        const { labReportId, filePath, fileName } = await request.json()

        if (!labReportId || !filePath) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Update status to processing
        await updateLabReportStatus(labReportId, 'processing');

        try {
            // Get the file URL from InstantDB storage
            const filesQuery = await db.query({
                $files: {
                    $: {
                        where: { path: filePath }
                    }
                }
            })

            const file = filesQuery.$files[0]
            if (!file || !file.url) {
                throw new Error('File not found or URL not available')
            }

            const fileUrl = file.url as string
            console.log("file url", fileUrl)

            // Analyze the file based on its type
            let analysisResult;

            if (isImageFile(fileName)) {
                analysisResult = await analyzeImageWithAI(fileUrl);
            } else {
                analysisResult = await analyzeDocumentWithAI(fileUrl, fileName);
            }

            // Update the lab report with AI results
            await updateLabReportStatus(labReportId, 'completed', {
                aiSummary: analysisResult.summary,
                aiTranscription: analysisResult.transcription,
            });

            return NextResponse.json({
                success: true,
                summary: analysisResult.summary,
                transcription: analysisResult.transcription,
            })

        } catch (aiError) {
            console.error('AI processing error:', aiError)

            // Update status to error
            await updateLabReportStatus(labReportId, 'error');

            return NextResponse.json(
                { error: 'Failed to process file with AI' },
                { status: 500 }
            )
        }

    } catch (error) {
        console.error('Process file error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 