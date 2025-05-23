import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/auth';
import { documentService } from '@/lib/services/documents';
import { DocumentFilter } from '@/lib/types/documents';

export async function GET(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);

        const filter: DocumentFilter = {
            category: searchParams.get('category') as any || 'all',
            folder_path: searchParams.get('folder') || undefined,
            search: searchParams.get('search') || undefined,
            tags: searchParams.get('tags')?.split(',') || undefined,
            date_range: {
                start: searchParams.get('start_date') || undefined,
                end: searchParams.get('end_date') || undefined,
            }
        };

        // Remove empty date_range if no dates provided
        if (!filter.date_range?.start && !filter.date_range?.end) {
            delete filter.date_range;
        }

        const documents = await documentService.getDocuments(user.id, filter);

        return NextResponse.json({
            documents,
            total: documents.length
        });

    } catch (error: any) {
        console.error('Error fetching documents:', error);
        return NextResponse.json(
            { error: `Failed to fetch documents: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get('id');

        if (!documentId) {
            return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
        }

        const updates = await request.json();

        const document = await documentService.updateDocument(user.id, documentId, updates);

        return NextResponse.json({ document });

    } catch (error: any) {
        console.error('Error updating document:', error);
        return NextResponse.json(
            { error: `Failed to update document: ${error.message}` },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const user = await getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const documentId = searchParams.get('id');

        if (!documentId) {
            return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
        }

        await documentService.deleteDocument(user.id, documentId);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { error: `Failed to delete document: ${error.message}` },
            { status: 500 }
        );
    }
} 