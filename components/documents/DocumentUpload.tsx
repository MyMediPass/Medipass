"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileText, Image, File, AlertCircle, CheckCircle } from 'lucide-react';
import { DocumentUploadData, DocumentCategory, CATEGORY_CONFIG, UploadProgress, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/lib/types/documents';

// Utility functions moved here since we can't import from services
function validateFileType(file: File): boolean {
    const allAllowedTypes = [
        ...ALLOWED_FILE_TYPES.pdf,
        ...ALLOWED_FILE_TYPES.image,
        ...ALLOWED_FILE_TYPES.document
    ];

    return allAllowedTypes.includes(file.type as any);
}

function validateFileSize(file: File): boolean {
    return file.size <= MAX_FILE_SIZE;
}

function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface DocumentUploadProps {
    onUploadComplete?: (documentIds: string[]) => void;
    folderPath?: string;
}

export function DocumentUpload({ onUploadComplete, folderPath = '/' }: DocumentUploadProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [metadata, setMetadata] = useState<DocumentUploadData>({
        display_name: '',
        category: 'general',
        folder_path: folderPath,
        tags: [],
        notes: '',
        provider: '',
        date_taken: ''
    });
    const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
    const [isUploading, setIsUploading] = useState(false);
    const [tagInput, setTagInput] = useState('');

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const validFiles = acceptedFiles.filter(file => {
            const isValidType = validateFileType(file);
            const isValidSize = validateFileSize(file);

            if (!isValidType || !isValidSize) {
                // Show error for invalid files
                console.error(`Invalid file: ${file.name}`);
                return false;
            }
            return true;
        });

        setFiles(prev => [...prev, ...validFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
        },
        maxSize: 50 * 1024 * 1024 // 50MB
    });

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const addTag = (tag: string) => {
        const trimmedTag = tag.trim();
        if (trimmedTag && !metadata.tags?.includes(trimmedTag)) {
            setMetadata(prev => ({
                ...prev,
                tags: [...(prev.tags || []), trimmedTag]
            }));
        }
        setTagInput('');
    };

    const removeTag = (tagToRemove: string) => {
        setMetadata(prev => ({
            ...prev,
            tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
        }));
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput) {
            e.preventDefault();
            addTag(tagInput);
        }
    };

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) return <Image className="h-4 w-4" />;
        if (file.type === 'application/pdf') return <FileText className="h-4 w-4" />;
        return <File className="h-4 w-4" />;
    };

    const uploadFiles = async () => {
        if (files.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();

        // Add files
        files.forEach(file => {
            formData.append('files', file);
        });

        // Add metadata
        formData.append('metadata', JSON.stringify({
            ...metadata,
            folder_path: folderPath
        }));

        try {
            const response = await fetch('/api/documents/upload', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                const documentIds = result.uploaded.map((item: any) => item.document_id);
                onUploadComplete?.(documentIds);

                // Reset form
                setFiles([]);
                setMetadata({
                    display_name: '',
                    category: 'general',
                    folder_path: folderPath,
                    tags: [],
                    notes: '',
                    provider: '',
                    date_taken: ''
                });
                setIsOpen(false);
            } else {
                console.error('Upload failed:', result.errors);
            }
        } catch (error) {
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
            setUploadProgress({});
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Documents
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Upload Documents</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Drop Zone */}
                    <Card>
                        <CardContent className="p-6">
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-300 hover:border-primary/50'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                {isDragActive ? (
                                    <p className="text-lg font-medium">Drop files here...</p>
                                ) : (
                                    <div>
                                        <p className="text-lg font-medium mb-2">Drag & drop files here</p>
                                        <p className="text-sm text-gray-500 mb-4">
                                            or click to browse files
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Supports PDF, DOC, DOCX, JPG, PNG, HEIC • Max 50MB per file
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Selected Files */}
                    {files.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="font-medium">Selected Files ({files.length})</h3>
                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            {getFileIcon(file)}
                                            <span className="text-sm font-medium truncate">{file.name}</span>
                                            <Badge variant="outline" className="text-xs">
                                                {formatFileSize(file.size)}
                                            </Badge>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => removeFile(index)}
                                            disabled={isUploading}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Metadata Form */}
                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={metadata.category}
                                onValueChange={(value: DocumentCategory) =>
                                    setMetadata(prev => ({ ...prev, category: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                                        <SelectItem key={key} value={key}>
                                            {config.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="provider">Healthcare Provider (Optional)</Label>
                            <Input
                                id="provider"
                                value={metadata.provider}
                                onChange={(e) => setMetadata(prev => ({ ...prev, provider: e.target.value }))}
                                placeholder="e.g., Dr. Smith, LabCorp"
                            />
                        </div>

                        <div>
                            <Label htmlFor="date_taken">Document Date (Optional)</Label>
                            <Input
                                id="date_taken"
                                type="date"
                                value={metadata.date_taken}
                                onChange={(e) => setMetadata(prev => ({ ...prev, date_taken: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="tags">Tags</Label>
                            <div className="space-y-2">
                                <Input
                                    id="tags"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Add tags and press Enter"
                                />
                                {metadata.tags && metadata.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1">
                                        {metadata.tags.map((tag, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {tag}
                                                <button
                                                    onClick={() => removeTag(tag)}
                                                    className="ml-1 hover:text-red-500"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <Textarea
                                id="notes"
                                value={metadata.notes}
                                onChange={(e) => setMetadata(prev => ({ ...prev, notes: e.target.value }))}
                                placeholder="Additional notes about this document..."
                                rows={3}
                            />
                        </div>
                    </div>

                    {/* Upload Button */}
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setIsOpen(false)}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={uploadFiles}
                            disabled={files.length === 0 || isUploading}
                        >
                            {isUploading ? 'Uploading...' : `Upload ${files.length} File${files.length !== 1 ? 's' : ''}`}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 