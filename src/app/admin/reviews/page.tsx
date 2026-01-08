'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Star, Check, X, Trash2, Eye, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface Review {
    id: string;
    customerName: string;
    customerEmail: string | null;
    rating: number;
    title: string | null;
    comment: string;
    isVerified: boolean;
    isApproved: boolean;
    createdAt: string;
    product: {
        name: string;
        slug: string;
        thumbImage: string;
    };
}

export default function AdminReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [status, setStatus] = useState<'all' | 'pending' | 'approved'>('pending');
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/reviews?page=${page}&status=${status}`);
            const data = await res.json();
            setReviews(data.reviews || []);
            setTotalPages(data.totalPages || 1);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [page, status]);

    const handleApprove = async (id: string, approve: boolean) => {
        setActionLoading(id);
        try {
            const res = await fetch('/api/admin/reviews', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isApproved: approve }),
            });
            if (res.ok) {
                fetchReviews();
            }
        } catch (error) {
            console.error('Error updating review:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        setActionLoading(id);
        try {
            const res = await fetch(`/api/admin/reviews?id=${id}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                fetchReviews();
            }
        } catch (error) {
            console.error('Error deleting review:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const StarRating = ({ rating }: { rating: number }) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                />
            ))}
        </div>
    );

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Product Reviews</h1>
                        <p className="text-sm text-gray-500">Manage and approve customer reviews</p>
                    </div>
                    <button onClick={fetchReviews} className="p-2 hover:bg-gray-100 rounded-lg">
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {/* Status Tabs */}
                <div className="flex gap-2">
                    {(['pending', 'approved', 'all'] as const).map((s) => (
                        <button
                            key={s}
                            onClick={() => { setStatus(s); setPage(1); }}
                            className={`px-4 py-2 rounded-lg font-medium text-sm capitalize transition-colors ${status === s
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12 text-gray-500">Loading reviews...</div>
                    ) : reviews.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                            <p className="text-gray-500">No {status} reviews found</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                <div className="flex items-start gap-4">
                                    {/* Product Image */}
                                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                        {review.product.thumbImage && (
                                            <img
                                                src={review.product.thumbImage}
                                                alt={review.product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>

                                    {/* Review Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <Link
                                                    href={`/product/${review.product.slug}`}
                                                    className="text-sm font-medium text-purple-600 hover:underline"
                                                >
                                                    {review.product.name}
                                                </Link>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-medium text-gray-900">{review.customerName}</span>
                                                    <StarRating rating={review.rating} />
                                                    {review.isVerified && (
                                                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                                            Verified
                                                        </span>
                                                    )}
                                                    {review.isApproved && (
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                                            Approved
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 whitespace-nowrap">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {review.title && (
                                            <h4 className="font-medium text-gray-900 mt-2">{review.title}</h4>
                                        )}
                                        <p className="text-gray-600 text-sm mt-1">{review.comment}</p>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 mt-3">
                                            {!review.isApproved && (
                                                <button
                                                    onClick={() => handleApprove(review.id, true)}
                                                    disabled={actionLoading === review.id}
                                                    className="inline-flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    <Check className="w-3.5 h-3.5" />
                                                    Approve
                                                </button>
                                            )}
                                            {review.isApproved && (
                                                <button
                                                    onClick={() => handleApprove(review.id, false)}
                                                    disabled={actionLoading === review.id}
                                                    className="inline-flex items-center gap-1 text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                    Unapprove
                                                </button>
                                            )}
                                            <Link
                                                href={`/product/${review.product.slug}`}
                                                className="inline-flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View Product
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                disabled={actionLoading === review.id}
                                                className="inline-flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-gray-600">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
