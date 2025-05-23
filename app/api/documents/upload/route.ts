import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { documentService, validateFileType, validateFileSize, generateFilePath } from '@/lib/services/documents';
import { DocumentUploadData } from '@/lib/types/documents';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];
        const metadataStr = formData.get('metadata') as string;

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        let uploadMetadata: DocumentUploadData = {
            display_name: '',
            category: 'general',
            folder_path: '/',
            tags: [],
            notes: '',
            provider: ''
        };

        if (metadataStr) {
            try {
                uploadMetadata = { ...uploadMetadata, ...JSON.parse(metadataStr) };
            } catch (e) {
                console.error('Invalid metadata JSON:', e);
            }
        }

        const supabase = createSupabaseServiceRoleClient();
        const uploadResults = [];
        const errors = [];

        for (const file of files) {
            try {
                // Validate file
                if (!validateFileType(file)) {
                    errors.push({ file: file.name, error: 'Invalid file type' });
                    continue;
                }

                if (!validateFileSize(file)) {
                    errors.push({ file: file.name, error: 'File too large (max 50MB)' });
                    continue;
                }

                // Generate file path
                const filePath = generateFilePath(user.id, uploadMetadata.folder_path || '/', file.name);

                // Upload to Supabase Storage
                const fileBuffer = Buffer.from(await file.arrayBuffer());
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('user-documents')
                    .upload(filePath, fileBuffer, {
                        contentType: file.type,
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Storage upload error:', uploadError);
                    errors.push({ file: file.name, error: `Upload failed: ${uploadError.message}` });
                    continue;
                }

                // Create document record
                const documentData = {
                    user_id: user.id,
                    file_name: file.name,
                    display_name: uploadMetadata.display_name || file.name,
                    file_path: filePath,
                    file_size: file.size,
                    file_type: file.type,
                    category: uploadMetadata.category,
                    folder_path: uploadMetadata.folder_path || '/',
                    tags: uploadMetadata.tags || [],
                    notes: uploadMetadata.notes || null,
                    provider: uploadMetadata.provider || null,
                    date_taken: uploadMetadata.date_taken || null,
                    metadata: {}
                };

                const document = await documentService.createDocument(documentData);

                // If it's a PDF and category is lab, trigger AI processing
                if (file.type === 'application/pdf' && uploadMetadata.category === 'lab') {
                    // TODO: Integrate with existing PDF extraction
                    console.log('PDF lab document uploaded - would trigger AI processing');
                }

                uploadResults.push({
                    file: file.name,
                    document_id: document.id,
                    file_path: uploadData.path,
                    success: true
                });

            } catch (error: any) {
                console.error(`Error processing file ${file.name}:`, error);
                errors.push({ file: file.name, error: error.message || 'Unknown error' });
            }
        }

        const response = {
            success: uploadResults.length > 0,
            uploaded: uploadResults,
            errors,
            total_uploaded: uploadResults.length,
            total_errors: errors.length
        };

        const status = uploadResults.length > 0 ? 200 : 400;
        return NextResponse.json(response, { status });

    } catch (error: any) {
        console.error('Upload operation failed:', error);
        return NextResponse.json(
            { error: `Upload failed: ${error.message || 'Unknown error'}` },
            { status: 500 }
        );
    }
}

// Handle file size limits
export const runtime = 'nodejs';
export const maxDuration = 60; // 1 minute timeout 