'use client';

import { useState, useRef } from 'react';
import { Plus, X, Loader2, AlertCircle } from 'lucide-react';

interface MediaUploaderProps {
    value: string; // mediaId or empty
    onChange: (value: string) => void;
    type?: 'image' | 'video' | 'any';
    label?: string;
    className?: string;
}

const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_VIDEO_SIZE = 5 * 1024 * 1024; // 5 MB

export default function MediaUploader({
    value,
    onChange,
    type = 'image',
    label,
    className = '',
}: MediaUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const accept = type === 'video' ? 'video/*' : type === 'image' ? 'image/*' : 'image/*,video/*';
    const maxSize = type === 'video' ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    const maxSizeMB = maxSize / (1024 * 1024);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError('');

        // Client-side size validation
        if (file.size > maxSize) {
            setError(`File too large. Maximum ${maxSizeMB}MB allowed.`);
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/admin/media', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            onChange(data.id);
        } catch (err) {
            console.error('Upload error:', err);
            setError((err as Error).message || 'Upload failed');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = () => {
        onChange('');
        setError('');
    };

    const mediaUrl = value ? `/api/media/${value}` : '';

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div className="flex items-center gap-4">
                {/* Preview */}
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                    {uploading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                    ) : value ? (
                        <>
                            {type === 'video' ? (
                                <video
                                    src={mediaUrl}
                                    className="w-full h-full object-cover"
                                    muted
                                    loop
                                    autoPlay
                                    playsInline
                                />
                            ) : (
                                <img
                                    src={mediaUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover"
                                />
                            )}
                            <button
                                type="button"
                                onClick={handleRemove}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </>
                    ) : (
                        <Plus className="w-6 h-6 text-gray-400" />
                    )}
                </div>

                {/* Upload Button */}
                <div className="flex-1">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={accept}
                        onChange={handleFileSelect}
                        disabled={uploading}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Max size: {maxSizeMB}MB • {type === 'video' ? 'MP4, WebM' : 'JPG, PNG, WebP'}
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}
        </div>
    );
}
