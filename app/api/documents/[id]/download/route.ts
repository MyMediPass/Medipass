import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { documentService } from '@/lib/services/documents';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: documentId } = await params;

        // Verify user owns the document
        const document = await documentService.getDocument(user.id, documentId);
        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // Generate signed URL
        const signedUrl = await documentService.getSignedUrl(document.file_path, 300); // 5 minutes

        return NextResponse.json({
            download_url: signedUrl,
            file_name: document.file_name,
            expires_in: 300
        });

    } catch (error: any) {
        console.error('Error generating download URL:', error);
        return NextResponse.json(
            { error: `Failed to generate download URL: ${error.message}` },
            { status: 500 }
        );
    }
} 