'use client';

import { useState, useEffect } from 'react';
import { Star, CheckCircle, User } from 'lucide-react';

interface Review {
    id: string;
    customerName: string;
    rating: number;
    title: string | null;
    comment: string;
    isVerified: boolean;
    createdAt: string;
}

interface ProductReviewsProps {
    productId: string;
    productName: string;
}

export default function ProductReviews({ productId, productName }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [averageRating, setAverageRating] = useState(0);
    const [totalReviews, setTotalReviews] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        rating: 5,
        title: '',
        comment: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            const data = await res.json();
            setReviews(data.reviews || []);
            setAverageRating(data.averageRating || 0);
            setTotalReviews(data.totalReviews || 0);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSubmitMessage('');

        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, productId }),
            });
            const data = await res.json();

            if (res.ok) {
                setSubmitMessage(data.message);
                setFormData({ customerName: '', customerEmail: '', rating: 5, title: '', comment: '' });
                setShowForm(false);
            } else {
                setSubmitMessage(data.error || 'Failed to submit review');
            }
        } catch {
            setSubmitMessage('Failed to submit review');
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = ({ rating, interactive = false, onChange }: { rating: number; interactive?: boolean; onChange?: (rating: number) => void }) => (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type={interactive ? 'button' : undefined}
                    onClick={() => interactive && onChange?.(star)}
                    className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
                    disabled={!interactive}
                >
                    <Star
                        className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                </button>
            ))}
        </div>
    );

    return (
        <div className="mt-12 border-t border-zinc-200 pt-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900">Customer Reviews</h2>
                    {totalReviews > 0 && (
                        <div className="flex items-center gap-3 mt-2">
                            <StarRating rating={Math.round(averageRating)} />
                            <span className="text-lg font-semibold text-zinc-900">{averageRating.toFixed(1)}</span>
                            <span className="text-zinc-500">({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                >
                    Write a Review
                </button>
            </div>

            {submitMessage && (
                <div className={`mb-6 p-4 rounded-lg ${submitMessage.includes('Thank') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {submitMessage}
                </div>
            )}

            {/* Review Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-zinc-50 rounded-xl p-6 mb-8 border border-zinc-200">
                    <h3 className="font-semibold text-lg mb-4">Write a review for {productName}</h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-zinc-700 mb-2">Your Rating</label>
                        <StarRating
                            rating={formData.rating}
                            interactive
                            onChange={(rating) => setFormData({ ...formData, rating })}
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Your Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-zinc-700 mb-1">Your Email (for verified badge)</label>
                            <input
                                type="email"
                                value={formData.customerEmail}
                                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Review Title</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="Summarize your experience"
                            className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-zinc-700 mb-1">Your Review *</label>
                        <textarea
                            required
                            rows={4}
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                            placeholder="What did you like or dislike about this product?"
                            className="w-full px-4 py-2.5 border border-zinc-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 px-6 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="text-center py-12 text-zinc-500">Loading reviews...</div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-zinc-50 rounded-xl">
                    <User className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                    <p className="text-zinc-600 font-medium">No reviews yet</p>
                    <p className="text-zinc-500 text-sm">Be the first to share your experience!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-white border border-zinc-200 rounded-xl p-6">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-zinc-900">{review.customerName}</span>
                                        {review.isVerified && (
                                            <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                <CheckCircle className="w-3 h-3" />
                                                Verified Purchase
                                            </span>
                                        )}
                                    </div>
                                    <StarRating rating={review.rating} />
                                </div>
                                <span className="text-sm text-zinc-500">
                                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                            {review.title && (
                                <h4 className="font-semibold text-zinc-900 mb-1">{review.title}</h4>
                            )}
                            <p className="text-zinc-600">{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
