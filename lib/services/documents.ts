import { createClient } from '@/lib/supabase/server';
import { createSupabaseServiceRoleClient } from '@/lib/supabase';
import {
    UserDocument,
    UserFolder,
    DocumentFilter,
    DocumentStats,
    DocumentCategory,
    ALLOWED_FILE_TYPES,
    MAX_FILE_SIZE
} from '@/lib/types/documents';

export class DocumentService {
    private supabase = createSupabaseServiceRoleClient();

    // Document CRUD operations
    async getDocuments(userId: string, filter?: DocumentFilter): Promise<UserDocument[]> {
        let query = this.supabase
            .from('user_documents')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (filter?.category && filter.category !== 'all') {
            query = query.eq('category', filter.category);
        }

        if (filter?.folder_path) {
            query = query.eq('folder_path', filter.folder_path);
        }

        if (filter?.search) {
            query = query.or(`display_name.ilike.%${filter.search}%,notes.ilike.%${filter.search}%,provider.ilike.%${filter.search}%`);
        }

        if (filter?.tags && filter.tags.length > 0) {
            query = query.overlaps('tags', filter.tags);
        }

        if (filter?.date_range?.start) {
            query = query.gte('created_at', filter.date_range.start);
        }

        if (filter?.date_range?.end) {
            query = query.lte('created_at', filter.date_range.end);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching documents:', error);
            throw new Error(`Failed to fetch documents: ${error.message}`);
        }

        return (data || []) as unknown as UserDocument[];
    }

    async getDocument(userId: string, documentId: string): Promise<UserDocument | null> {
        const { data, error } = await this.supabase
            .from('user_documents')
            .select('*')
            .eq('user_id', userId)
            .eq('id', documentId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            console.error('Error fetching document:', error);
            throw new Error(`Failed to fetch document: ${error.message}`);
        }

        return data as unknown as UserDocument;
    }

    async createDocument(documentData: Omit<UserDocument, 'id' | 'created_at' | 'updated_at'>): Promise<UserDocument> {
        const { data, error } = await this.supabase
            .from('user_documents')
            .insert(documentData)
            .select('*')
            .single();

        if (error) {
            console.error('Error creating document:', error);
            throw new Error(`Failed to create document: ${error.message}`);
        }

        return data as unknown as UserDocument;
    }

    async updateDocument(userId: string, documentId: string, updates: Partial<UserDocument>): Promise<UserDocument> {
        const { data, error } = await this.supabase
            .from('user_documents')
            .update(updates)
            .eq('user_id', userId)
            .eq('id', documentId)
            .select('*')
            .single();

        if (error) {
            console.error('Error updating document:', error);
            throw new Error(`Failed to update document: ${error.message}`);
        }

        return data as unknown as UserDocument;
    }

    async deleteDocument(userId: string, documentId: string): Promise<void> {
        // First get the document to get the file path
        const document = await this.getDocument(userId, documentId);
        if (!document) {
            throw new Error('Document not found');
        }

        // Delete the file from storage
        const { error: storageError } = await this.supabase.storage
            .from('user-documents')
            .remove([document.file_path]);

        if (storageError) {
            console.error('Error deleting file from storage:', storageError);
            // Continue with database deletion even if storage deletion fails
        }

        // Delete the document record
        const { error } = await this.supabase
            .from('user_documents')
            .delete()
            .eq('user_id', userId)
            .eq('id', documentId);

        if (error) {
            console.error('Error deleting document:', error);
            throw new Error(`Failed to delete document: ${error.message}`);
        }
    }

    // Folder operations
    async getFolders(userId: string): Promise<UserFolder[]> {
        const { data, error } = await this.supabase
            .from('user_folders')
            .select('*')
            .eq('user_id', userId)
            .order('folder_path');

        if (error) {
            console.error('Error fetching folders:', error);
            throw new Error(`Failed to fetch folders: ${error.message}`);
        }

        return (data || []) as unknown as UserFolder[];
    }

    async createFolder(userId: string, folderData: Omit<UserFolder, 'id' | 'user_id' | 'created_at'>): Promise<UserFolder> {
        const { data, error } = await this.supabase
            .from('user_folders')
            .insert({ ...folderData, user_id: userId })
            .select('*')
            .single();

        if (error) {
            console.error('Error creating folder:', error);
            throw new Error(`Failed to create folder: ${error.message}`);
        }

        return data as unknown as UserFolder;
    }

    async deleteFolder(userId: string, folderId: string): Promise<void> {
        // Check if folder has documents
        const { data: documents } = await this.supabase
            .from('user_documents')
            .select('id')
            .eq('user_id', userId)
            .eq('folder_path', folderId);

        if (documents && documents.length > 0) {
            throw new Error('Cannot delete folder that contains documents');
        }

        const { error } = await this.supabase
            .from('user_folders')
            .delete()
            .eq('user_id', userId)
            .eq('id', folderId);

        if (error) {
            console.error('Error deleting folder:', error);
            throw new Error(`Failed to delete folder: ${error.message}`);
        }
    }

    // File operations
    async getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
        const { data, error } = await this.supabase.storage
            .from('user-documents')
            .createSignedUrl(filePath, expiresIn);

        if (error) {
            console.error('Error creating signed URL:', error);
            throw new Error(`Failed to create download URL: ${error.message}`);
        }

        return data.signedUrl;
    }

    // Analytics
    async getDocumentStats(userId: string): Promise<DocumentStats> {
        const { data: documents, error } = await this.supabase
            .from('user_documents')
            .select('category, file_size, created_at')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching document stats:', error);
            throw new Error(`Failed to fetch document stats: ${error.message}`);
        }

        const categories: Record<DocumentCategory, number> = {
            lab: 0,
            prescription: 0,
            imaging: 0,
            insurance: 0,
            general: 0,
            report: 0,
            immunization: 0,
            photo: 0
        };

        let totalSize = 0;
        let recentUploads = 0;
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        documents?.forEach(doc => {
            const typedDoc = doc as any;
            categories[typedDoc.category as DocumentCategory]++;
            totalSize += Number(typedDoc.file_size);

            if (new Date(typedDoc.created_at) >= oneWeekAgo) {
                recentUploads++;
            }
        });

        return {
            total_documents: documents?.length || 0,
            total_size: totalSize,
            categories,
            recent_uploads: recentUploads
        };
    }
}

// Utility functions
export function validateFileType(file: File): boolean {
    const allAllowedTypes = [
        ...ALLOWED_FILE_TYPES.pdf,
        ...ALLOWED_FILE_TYPES.image,
        ...ALLOWED_FILE_TYPES.document
    ];

    return allAllowedTypes.includes(file.type as any);
}

export function validateFileSize(file: File): boolean {
    return file.size <= MAX_FILE_SIZE;
}

export function sanitizeFileName(fileName: string): string {
    return fileName
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
}

export function generateFilePath(userId: string, folder: string, fileName: string): string {
    const timestamp = Date.now();
    const sanitizedFileName = sanitizeFileName(fileName);
    return `users/${userId}/documents${folder}/${timestamp}-${sanitizedFileName}`;
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType === 'application/pdf') return 'FileText';
    if (fileType.includes('word') || fileType.includes('document')) return 'FileText';
    return 'File';
}

// Create singleton instance
export const documentService = new DocumentService(); 