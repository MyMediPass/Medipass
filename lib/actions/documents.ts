'use server';

import { documentService } from '@/lib/services/documents';
import { DocumentFilter } from '@/lib/types/documents';
import { getUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getDocuments(filter?: DocumentFilter) {
    const user = await getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    return await documentService.getDocuments(user.id, filter);
}

export async function deleteDocument(documentId: string) {
    const user = await getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    await documentService.deleteDocument(user.id, documentId);
    revalidatePath('/documents');
}

export async function getDownloadUrl(documentId: string) {
    const user = await getUser();
    if (!user) {
        throw new Error('Unauthorized');
    }

    const document = await documentService.getDocument(user.id, documentId);
    if (!document) {
        throw new Error('Document not found');
    }

    const signedUrl = await documentService.getSignedUrl(document.file_path, 300);
    return {
        download_url: signedUrl,
        file_name: document.file_name,
        expires_in: 300
    };
} 