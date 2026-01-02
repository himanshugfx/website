'use client';

import { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';

export default function ImportOrdersPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{
        success: boolean;
        message: string;
        imported?: number;
        errors?: string[];
    } | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xls')) {
                setFile(selectedFile);
                setResult(null);
            } else {
                alert('Please select an Excel file (.xlsx or .xls)');
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first');
            return;
        }

        setUploading(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/admin/import-orders', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok) {
                setResult({
                    success: true,
                    message: data.message || 'Orders imported successfully',
                    imported: data.imported,
                    errors: data.errors,
                });
                setFile(null);
                // Reset file input
                const fileInput = document.getElementById('file-input') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
            } else {
                setResult({
                    success: false,
                    message: data.error || 'Failed to import orders',
                    errors: data.errors,
                });
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            setResult({
                success: false,
                message: 'An error occurred while uploading the file',
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Import Past Orders</h1>
                    <p className="text-gray-500 mt-2">Upload an Excel file to import previous orders and customer data</p>
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Excel File Format Requirements
                    </h3>
                    <div className="space-y-2 text-blue-800">
                        <p className="font-medium">Required columns (in order):</p>
                        <ol className="list-decimal list-inside space-y-1 ml-4">
                            <li><strong>Order Number</strong> - Unique order identifier</li>
                            <li><strong>Customer Name</strong> - Full name of the customer</li>
                            <li><strong>Customer Email</strong> - Email address (required for account creation)</li>
                            <li><strong>Customer Phone</strong> - Phone number (optional)</li>
                            <li><strong>Product Name</strong> - Name of the product</li>
                            <li><strong>Quantity</strong> - Number of items</li>
                            <li><strong>Price</strong> - Price per item</li>
                            <li><strong>Total Amount</strong> - Total order amount</li>
                            <li><strong>Order Status</strong> - PENDING, PROCESSING, COMPLETED, or CANCELLED</li>
                            <li><strong>Payment Status</strong> - PENDING, SUCCESSFUL, or FAILED</li>
                            <li><strong>Payment Method</strong> - ONLINE, COD, etc.</li>
                            <li><strong>Order Date</strong> - Date in YYYY-MM-DD format</li>
                            <li><strong>Shipping Address</strong> - Delivery address (optional)</li>
                        </ol>
                        <p className="mt-4 text-sm">
                            <strong>Note:</strong> Each row represents an order item. Multiple items from the same order should have the same Order Number.
                        </p>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-900 mb-2">
                                Select Excel File
                            </label>
                            <div className="flex items-center gap-4">
                                <label
                                    htmlFor="file-input"
                                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold cursor-pointer shadow-lg"
                                >
                                    <Upload className="w-5 h-5" />
                                    Choose File
                                </label>
                                <input
                                    id="file-input"
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {file && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <FileSpreadsheet className="w-5 h-5 text-green-600" />
                                        <span className="font-medium">{file.name}</span>
                                        <span className="text-sm text-gray-500">
                                            ({(file.size / 1024).toFixed(2)} KB)
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {file && (
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="w-full px-6 py-3 bg-black text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        Import Orders
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Result */}
                {result && (
                    <div
                        className={`rounded-2xl border p-6 ${result.success
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                            }`}
                    >
                        <div className="flex items-start gap-3">
                            {result.success ? (
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                                <h3
                                    className={`font-semibold mb-2 ${result.success ? 'text-green-900' : 'text-red-900'
                                        }`}
                                >
                                    {result.success ? 'Import Successful' : 'Import Failed'}
                                </h3>
                                <p
                                    className={`mb-2 ${result.success ? 'text-green-800' : 'text-red-800'
                                        }`}
                                >
                                    {result.message}
                                </p>
                                {result.imported !== undefined && (
                                    <p className="text-green-800 font-medium">
                                        {result.imported} orders imported successfully
                                    </p>
                                )}
                                {result.errors && result.errors.length > 0 && (
                                    <div className="mt-4">
                                        <p className="font-semibold text-red-900 mb-2">Errors:</p>
                                        <ul className="list-disc list-inside space-y-1 text-red-800 text-sm">
                                            {result.errors.map((error, idx) => (
                                                <li key={idx}>{error}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}

