import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// API endpoint for Ana chatbot to get product information
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get('q');
    const action = searchParams.get('action');

    try {
        // If action is "list", return all products summary
        if (action === 'list') {
            const products = await prisma.product.findMany({
                select: {
                    id: true,
                    name: true,
                    price: true,
                    category: true,
                    description: true,
                    ingredients: true,
                    sizes: true,
                    quantity: true,
                },
                take: 20,
                orderBy: { sold: 'desc' },
            });
            return NextResponse.json({ products });
        }

        // If query provided, search for specific product
        if (query && query.length >= 2) {
            const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 1);
            const queryWithoutSpaces = query.replace(/\s+/g, '').toLowerCase();

            const products = await prisma.product.findMany({
                where: {
                    OR: [
                        { name: { contains: query, mode: 'insensitive' } },
                        { name: { contains: queryWithoutSpaces, mode: 'insensitive' } },
                        { category: { contains: query, mode: 'insensitive' } },
                        { ingredients: { contains: query, mode: 'insensitive' } },
                        // Add individual word matches for better suggestions
                        ...searchTerms.map(term => ({
                            name: { contains: term, mode: 'insensitive' }
                        }))
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    price: true,
                    originPrice: true,
                    category: true,
                    description: true,
                    ingredients: true,
                    sizes: true,
                    quantity: true,
                    slug: true,
                },
                take: 5,
            });

            return NextResponse.json({ products });
        }

        return NextResponse.json({ products: [] });
    } catch (error) {
        console.error('Ana products API error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
