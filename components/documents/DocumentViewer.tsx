"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ExternalLink, AlertCircle } from 'lucide-react';
import { UserDocument } from '@/lib/types/documents';

interface DocumentViewerProps {
    document: UserDocument | null;
    isOpen: boolean;
    onClose: () => void;
}

export function DocumentViewer({ document, isOpen, onClose }: DocumentViewerProps) {
    const [viewUrl, setViewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (document && isOpen) {
            fetchViewUrl();
        } else {
            setViewUrl(null);
            setError(null);
        }
    }, [document, isOpen]);

    const fetchViewUrl = async () => {
        if (!document) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/documents/${document.id}/download`);
            if (!response.ok) {
                throw new Error('Failed to get document URL');
            }

            const { download_url } = await response.json();
            setViewUrl(download_url);
        } catch (err) {
            console.error('Error fetching document URL:', err);
            setError('Failed to load document');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!document || !viewUrl) return;

        const link = document.createElement('a');
        link.href = viewUrl;
        link.download = document.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const openInNewTab = () => {
        if (viewUrl) {
            window.open(viewUrl, '_blank');
        }
    };

    const renderDocumentContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-96 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                    <p className="text-lg font-medium">Failed to load document</p>
                    <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    <Button onClick={fetchViewUrl} className="mt-4">
                        Try Again
                    </Button>
                </div>
            );
        }

        if (!viewUrl) return null;

        // Handle different file types
        if (document?.file_type === 'application/pdf') {
            return (
                <div className="w-full h-[80vh]">
                    <iframe
                        src={`${viewUrl}#view=FitH`}
                        className="w-full h-full border-0"
                        title={document.display_name}
                    />
                </div>
            );
        }

        if (document?.file_type.startsWith('image/')) {
            return (
                <div className="flex items-center justify-center p-4">
                    <img
                        src={viewUrl}
                        alt={document.display_name}
                        className="max-w-full max-h-[80vh] object-contain"
                    />
                </div>
            );
        }

        // For other document types, show download option
        return (
            <div className="flex flex-col items-center justify-center h-96 text-center">
                <p className="text-lg font-medium mb-2">Preview not available</p>
                <p className="text-sm text-muted-foreground mb-4">
                    This document type cannot be previewed in the browser.
                </p>
                <div className="flex gap-2">
                    <Button onClick={handleDownload}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                    </Button>
                    <Button variant="outline" onClick={openInNewTab}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in New Tab
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="truncate">{document?.display_name}</DialogTitle>
                        <div className="flex gap-2 ml-4">
                            <Button variant="outline" size="sm" onClick={handleDownload}>
                                <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={openInNewTab}>
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </DialogHeader>
                <div className="overflow-auto">
                    {renderDocumentContent()}
                </div>
            </DialogContent>
        </Dialog>
    );
} 