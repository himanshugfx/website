import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createRateLimiter, getClientIp } from '@/lib/rateLimit';

const reviewLimiter = createRateLimiter('reviews', {
    intervalMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 5,             // 5 reviews max per IP
});

// GET reviews for a product (or its constituent products if it is a bundle)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const approved = searchParams.get('approved');

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID is required' },
                { status: 400 }
            );
        }

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return NextResponse.json(
                { error: 'Product not found' },
                { status: 404 }
            );
        }

        const BUNDLE_PRODUCTS_MAPPING: Record<string, string[]> = {
            'facewash-100ml-sunscreen-bundle': [
                'beaded-facewash-100ml',
                'spf50-sunscreen-50ml'
            ],
            'facewash-100ml-sunscreen-facecream-bundle': [
                'beaded-facewash-100ml',
                'spf50-sunscreen-50ml',
                'anose-face-cream-15g'
            ]
        };

        let productIdsToFetch = [productId];
        let productLabelMap: Record<string, string> = {};

        // If it's a bundle, fetch reviews for constituent products as well
        if (product.type === 'bundle' && BUNDLE_PRODUCTS_MAPPING[product.slug]) {
            const constituentSlugs = BUNDLE_PRODUCTS_MAPPING[product.slug];
            const constituentProducts = await prisma.product.findMany({
                where: { slug: { in: constituentSlugs } },
                select: { id: true, name: true }
            });
            constituentProducts.forEach(cp => {
                productIdsToFetch.push(cp.id);
                productLabelMap[cp.id] = cp.name;
            });
        }

        const rawReviews = await prisma.productReview.findMany({
            where: {
                productId: { in: productIdsToFetch },
                isApproved: approved === 'all' ? undefined : true,
            },
            orderBy: { createdAt: 'desc' }
        });

        const reviews = rawReviews.map(r => ({
            ...r,
            productName: productLabelMap[r.productId] || product.name
        }));

        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            : 0;

        return NextResponse.json({
            reviews,
            stats: {
                total: totalReviews,
                average: Math.round(avgRating * 10) / 10,
                breakdown: {
                    5: reviews.filter(r => r.rating === 5).length,
                    4: reviews.filter(r => r.rating === 4).length,
                    3: reviews.filter(r => r.rating === 3).length,
                    2: reviews.filter(r => r.rating === 2).length,
                    1: reviews.filter(r => r.rating === 1).length,
                }
            }
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { error: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}

// POST a new review
export async function POST(request: Request) {
    try {
        const clientIp = getClientIp(request);
        const limitResult = reviewLimiter.check(clientIp);
        if (!limitResult.success) {
            return NextResponse.json(
                { error: 'Too many reviews submitted. Please try again later.' },
                {
                    status: 429,
                    headers: {
                        'Retry-After': String(Math.ceil((limitResult.reset - Date.now()) / 1000)),
                    },
                }
            );
        }

        const body = await request.json();
        const { productId, customerName, customerEmail, rating, title, comment } = body;

        if (!productId || !customerName || !rating || !comment) {
            return NextResponse.json(
                { error: 'Product ID, name, rating, and comment are required' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Check if customer has purchased this product (for verified badge)
        let isVerified = false;
        if (customerEmail) {
            const order = await prisma.order.findFirst({
                where: {
                    OR: [
                        { customerEmail },
                        { user: { email: customerEmail } }
                    ],
                    items: {
                        some: { productId }
                    },
                    status: { in: ['DELIVERED', 'SHIPPED', 'PROCESSING'] }
                }
            });
            isVerified = !!order;
        }

        const review = await prisma.productReview.create({
            data: {
                productId,
                customerName,
                customerEmail,
                rating,
                title,
                comment,
                isVerified,
                isApproved: false, // Requires admin approval
            }
        });

        return NextResponse.json({
            review,
            message: 'Thank you for your review! It will be published after approval.'
        });
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json(
            { error: 'Failed to submit review' },
            { status: 500 }
        );
    }
}
