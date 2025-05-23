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

        // Get the document to verify ownership
        const document = await documentService.getDocument(user.id, documentId);
        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }

        // For now, return the signed URL - in the future we could generate thumbnails here
        const signedUrl = await documentService.getSignedUrl(document.file_path, 300);

        return NextResponse.json({
            preview_url: signedUrl,
            file_type: document.file_type,
            expires_in: 300
        });

    } catch (error) {
        console.error('Preview generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate preview' },
            { status: 500 }
        );
    }
} 