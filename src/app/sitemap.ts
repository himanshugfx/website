import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { blogPosts } from './blog/blogData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://anose.in';

    // Fetch products
    const products = await prisma.product.findMany({
        select: { slug: true, updatedAt: true }
    });

    const productUrls = products.map((product) => ({
        url: `${baseUrl}/shop/product/${product.slug}`,
        lastModified: product.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    // Generate blog URLs from our static data (or DB if migrated)
    const blogUrls = blogPosts.map((post) => ({
        url: `${baseUrl}/blog/${post.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }));

    // Main pages
    const routes = [
        '',
        '/shop',
        '/blog',
        '/amenities',
        '/about',
        '/contact',
        '/shipping-policy',
        '/refund-policy',
        '/privacy-policy',
        '/terms-of-service',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.9,
    }));

    return [...routes, ...productUrls, ...blogUrls];
}
