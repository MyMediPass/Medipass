import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase'; // Import the service role client
import { inngest } from '@/inngest/client'; // Import the Inngest client
import { getUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        // Get user session
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
        }

        const fileName = file.name;
        const fileType = file.type;
        const fileBuffer = Buffer.from(await file.arrayBuffer()); // Get file content as buffer

        // 1. Upload file to Supabase
        const supabaseAdmin = createSupabaseServiceRoleClient();
        const bucketName = 'bucket'; // Your specified bucket name
        // Sanitize filename to prevent path traversal issues, though Supabase handles this well.
        // Create a unique path for the file to avoid overwrites and ensure organization.
        const supabaseFilePath = `uploads/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '')}`;

        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from(bucketName)
            .upload(supabaseFilePath, fileBuffer, {
                contentType: fileType,
                upsert: false, // true to overwrite if file exists, false to error
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return NextResponse.json({ error: `Supabase upload failed: ${uploadError.message}` }, { status: 500 });
        }

        console.log('File uploaded to Supabase:', uploadData?.path);

        // 2. Trigger Inngest job with user ID
        await inngest.send({
            name: 'file/analysis.requested', // Event name must match the one in Inngest function
            data: {
                filePathInBucket: supabaseFilePath, // Use the actual path in the bucket
                originalFileName: fileName,
                contentType: fileType,
                userId: user.id,
            },
        });

        console.log("Inngest event 'file/analysis.requested' sent.");

        return NextResponse.json({
            message: 'File uploaded successfully and analysis job triggered.',
            fileName,
            supabaseFilePath: uploadData?.path, // Return the actual path from Supabase
        });
    } catch (error: any) {
        console.error('Upload and Inngest trigger failed:', error);
        return NextResponse.json({ error: `Operation failed: ${error.message || 'Unknown error'}` }, { status: 500 });
    }
} 