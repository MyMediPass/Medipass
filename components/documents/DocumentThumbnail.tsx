"use client";

import { useState, useEffect } from 'react';
import { FileText, ImageIcon, FileIcon, Loader2, TestTube, Pill, Scan, Shield, Syringe, Camera } from 'lucide-react';
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

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'lab':
                return <TestTube className="h-6 w-6 text-blue-600" />;
            case 'prescription':
                return <Pill className="h-6 w-6 text-green-600" />;
            case 'imaging':
                return <Scan className="h-6 w-6 text-purple-600" />;
            case 'insurance':
                return <Shield className="h-6 w-6 text-orange-600" />;
            case 'immunization':
                return <Syringe className="h-6 w-6 text-emerald-600" />;
            case 'photo':
                return <Camera className="h-6 w-6 text-pink-600" />;
            case 'report':
                return <FileText className="h-6 w-6 text-teal-600" />;
            default:
                return <FileText className="h-6 w-6 text-gray-600" />;
        }
    };

    const getCategoryColors = (category: string) => {
        switch (category) {
            case 'lab':
                return 'bg-blue-50 border-blue-100';
            case 'prescription':
                return 'bg-green-50 border-green-100';
            case 'imaging':
                return 'bg-purple-50 border-purple-100';
            case 'insurance':
                return 'bg-orange-50 border-orange-100';
            case 'immunization':
                return 'bg-emerald-50 border-emerald-100';
            case 'photo':
                return 'bg-pink-50 border-pink-100';
            case 'report':
                return 'bg-teal-50 border-teal-100';
            default:
                return 'bg-gray-50 border-gray-100';
        }
    };

    const renderThumbnailContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center w-full h-full bg-gray-50">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
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

        // Medical category-based icons
        const categoryColors = getCategoryColors(document.category);
        const categoryIcon = getCategoryIcon(document.category);

        if (document.file_type === 'application/pdf') {
            return (
                <div className={`flex flex-col items-center justify-center w-full h-full ${categoryColors}`}>
                    {categoryIcon}
                    <span className="text-xs font-medium mt-1 text-gray-700">PDF</span>
                </div>
            );
        }

        if (document.file_type.startsWith('image/')) {
            return (
                <div className={`flex flex-col items-center justify-center w-full h-full ${categoryColors}`}>
                    <ImageIcon className="h-6 w-6 text-blue-600" />
                    <span className="text-xs font-medium mt-1 text-gray-700">Image</span>
                </div>
            );
        }

        if (
            document.file_type.includes('word') ||
            document.file_type.includes('document') ||
            document.file_type === 'text/plain'
        ) {
            return (
                <div className={`flex flex-col items-center justify-center w-full h-full ${categoryColors}`}>
                    {categoryIcon}
                    <span className="text-xs font-medium mt-1 text-gray-700">DOC</span>
                </div>
            );
        }

        // Default with category-specific styling
        return (
            <div className={`flex flex-col items-center justify-center w-full h-full ${categoryColors}`}>
                {categoryIcon}
                <span className="text-xs font-medium mt-1 text-gray-700">FILE</span>
            </div>
        );
    };

    return (
        <div className={`bg-white border rounded-lg overflow-hidden shadow-sm ${className}`}>
            {renderThumbnailContent()}
        </div>
    );
} 