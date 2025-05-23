"use client";

import { useState, useEffect } from 'react';
import { FileText, ImageIcon, FileIcon, Loader2 } from 'lucide-react';
import { UserDocument } from '@/lib/types/documents';

interface DocumentThumbnailProps {
    document: UserDocument;
    className?: string;
}

export function DocumentThumbnail({ document, className = "" }: DocumentThumbnailProps) {
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (document.file_type.startsWith('image/')) {
            fetchThumbnail();
        }
    }, [document]);

    const fetchThumbnail = async () => {
        setLoading(true);
        setError(false);

        try {
            const response = await fetch(`/api/documents/${document.id}/preview`);
            if (response.ok) {
                const { preview_url } = await response.json();
                setThumbnailUrl(preview_url);
            } else {
                setError(true);
            }
        } catch (err) {
            console.error('Error fetching thumbnail:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const renderThumbnailContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center w-full h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
            );
        }

        if (document.file_type.startsWith('image/') && thumbnailUrl && !error) {
            return (
                <img
                    src={thumbnailUrl}
                    alt={document.display_name}
                    className="w-full h-full object-cover"
                    onError={() => setError(true)}
                />
            );
        }

        // Fallback icons for different file types
        if (document.file_type === 'application/pdf') {
            return (
                <div className="flex flex-col items-center justify-center w-full h-full bg-red-50">
                    <FileText className="h-8 w-8 text-red-500 mb-1" />
                    <span className="text-xs text-red-600 font-medium">PDF</span>
                </div>
            );
        }

        if (document.file_type.startsWith('image/')) {
            return (
                <div className="flex flex-col items-center justify-center w-full h-full bg-blue-50">
                    <ImageIcon className="h-8 w-8 text-blue-500 mb-1" />
                    <span className="text-xs text-blue-600 font-medium">Image</span>
                </div>
            );
        }

        if (
            document.file_type.includes('word') ||
            document.file_type.includes('document') ||
            document.file_type === 'text/plain'
        ) {
            return (
                <div className="flex flex-col items-center justify-center w-full h-full bg-blue-50">
                    <FileText className="h-8 w-8 text-blue-500 mb-1" />
                    <span className="text-xs text-blue-600 font-medium">DOC</span>
                </div>
            );
        }

        // Default file icon
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-gray-50">
                <FileIcon className="h-8 w-8 text-gray-500 mb-1" />
                <span className="text-xs text-gray-600 font-medium">FILE</span>
            </div>
        );
    };

    return (
        <div className={`bg-muted rounded-md overflow-hidden ${className}`}>
            {renderThumbnailContent()}
        </div>
    );
} 