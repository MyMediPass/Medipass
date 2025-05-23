// Document Storage Types

export type DocumentCategory =
    | 'lab'
    | 'prescription'
    | 'imaging'
    | 'insurance'
    | 'general'
    | 'report'
    | 'immunization'
    | 'photo';

export interface UserDocument {
    id: string;
    user_id: string;
    file_name: string;
    display_name: string;
    file_path: string;
    file_size: number;
    file_type: string;
    category: DocumentCategory;
    folder_path: string;
    tags: string[];
    notes?: string;
    provider?: string;
    date_taken?: string;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface UserFolder {
    id: string;
    user_id: string;
    folder_name: string;
    folder_path: string;
    parent_folder_id?: string;
    color: string;
    created_at: string;
}

export interface DocumentUploadData {
    display_name: string;
    category: DocumentCategory;
    folder_path?: string;
    tags?: string[];
    notes?: string;
    provider?: string;
    date_taken?: string;
}

export interface DocumentFilter {
    category?: DocumentCategory | 'all';
    folder_path?: string;
    search?: string;
    tags?: string[];
    date_range?: {
        start?: string;
        end?: string;
    };
}

export interface UploadProgress {
    file_name: string;
    progress: number;
    status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
    error?: string;
}

export interface DocumentStats {
    total_documents: number;
    total_size: number;
    categories: Record<DocumentCategory, number>;
    recent_uploads: number;
}

// Utility type for creating new documents
export type CreateDocumentData = Omit<UserDocument, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

// Utility type for updating documents
export type UpdateDocumentData = Partial<Pick<UserDocument, 'display_name' | 'category' | 'folder_path' | 'tags' | 'notes' | 'provider' | 'date_taken'>>;

// File type validation
export const ALLOWED_FILE_TYPES = {
    pdf: ['application/pdf'],
    image: ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'],
    document: [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ]
} as const;

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const MAX_TOTAL_SIZE = 5 * 1024 * 1024 * 1024; // 5GB per user

// Category display configuration
export const CATEGORY_CONFIG: Record<DocumentCategory, {
    label: string;
    icon: string;
    color: string;
    description: string;
}> = {
    lab: {
        label: 'Lab Result',
        icon: 'TestTube',
        color: 'bg-blue-50 text-blue-700',
        description: 'Laboratory test results and reports'
    },
    prescription: {
        label: 'Prescription',
        icon: 'Pill',
        color: 'bg-orange-50 text-orange-700',
        description: 'Medication prescriptions and pharmacy documents'
    },
    imaging: {
        label: 'Imaging',
        icon: 'Scan',
        color: 'bg-purple-50 text-purple-700',
        description: 'X-rays, MRIs, CT scans and other medical imaging'
    },
    insurance: {
        label: 'Insurance',
        icon: 'Shield',
        color: 'bg-green-50 text-green-700',
        description: 'Insurance cards, policies, and claims'
    },
    report: {
        label: 'Medical Report',
        icon: 'FileText',
        color: 'bg-indigo-50 text-indigo-700',
        description: 'Doctor reports, consultation notes, and medical summaries'
    },
    immunization: {
        label: 'Immunization',
        icon: 'Syringe',
        color: 'bg-teal-50 text-teal-700',
        description: 'Vaccination records and immunization certificates'
    },
    photo: {
        label: 'Photo',
        icon: 'Camera',
        color: 'bg-pink-50 text-pink-700',
        description: 'Medical photos, skin conditions, and visual documentation'
    },
    general: {
        label: 'General',
        icon: 'File',
        color: 'bg-gray-50 text-gray-700',
        description: 'General medical documents and files'
    }
}; 