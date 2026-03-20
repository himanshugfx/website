import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/auth';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        await requireAdmin(request);

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        
        // 1. Valid Orders & Invoices
        const [validOrders, invoices, settings] = await Promise.all([
            prisma.order.findMany({
                where: {
                    status: { notIn: ['CANCELLED', 'REFUNDED', 'RETURNED'] },
                    paymentStatus: { not: 'FAILED' }
                },
                include: { items: { include: { product: true } } }
            }),
            prisma.invoice.findMany({
                where: { status: { not: 'VOID' } }
            }),
            prisma.analyticsSettings.upsert({
                where: { id: 'default' },
                update: {},
                create: { id: 'default', monthlyRevenueTarget: 300000 }
            })
        ]);

        const refundedOrders = await prisma.order.findMany({
            where: { status: { in: ['REFUNDED', 'RETURNED'] } }
        });

        // 2. Revenue calculations (Orders + Zoho Invoices without Order IDs to avoid double counting)
        const websiteRevenue = validOrders.reduce((sum, order) => sum + order.total, 0);
        const manualInvoiceRevenue = invoices.filter(inv => !inv.orderId).reduce((sum, inv) => sum + inv.total, 0);
        const totalRevenue = websiteRevenue + manualInvoiceRevenue;

        // Monthly Breakdown
        const thisMonthOrders = validOrders.filter(o => o.createdAt >= thisMonthStart);
        const thisMonthInvoices = invoices.filter(inv => !inv.orderId && inv.invoiceDate >= thisMonthStart);
        
        const thisMonthRevenue = thisMonthOrders.reduce((sum, order) => sum + order.total, 0) + 
                               thisMonthInvoices.reduce((sum, inv) => sum + inv.total, 0);
        
        const aov = validOrders.length > 0 ? websiteRevenue / validOrders.length : 0;
        
        const totalRefundsValue = refundedOrders.reduce((sum, order) => sum + order.total, 0);
        const refundRate = totalRevenue > 0 ? (totalRefundsValue / (totalRevenue + totalRefundsValue)) * 100 : 0;

        const discountImpact = validOrders.reduce((sum, order) => sum + (order.discountAmount || 0), 0);

        // 3. Category Revenue (Invoices don't usually have category breakdown in this schema, so sticking to Orders)
        const categoryMap = new Map<string, number>();
        validOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.product) {
                    const cat = item.product.category || 'Uncategorized';
                    const value = item.price * item.quantity;
                    categoryMap.set(cat, (categoryMap.get(cat) || 0) + value);
                }
            });
        });
        const revenueByCategory = Array.from(categoryMap.entries()).map(([name, value]) => ({ name, value }));

        // 4. Products & Inventory
        const allProducts = await prisma.product.findMany();
        
        // Top Products by sales
        const productSalesMap = new Map<string, { name: string, sales: number, revenue: number, stock: number }>();
        validOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.product) {
                    const existing = productSalesMap.get(item.product.id) || { name: item.product.name, sales: 0, revenue: 0, stock: item.product.quantity };
                    existing.sales += item.quantity;
                    existing.revenue += (item.price * item.quantity);
                    productSalesMap.set(item.product.id, existing);
                }
            });
        });
        
        const topProductsList = Array.from(productSalesMap.values()).sort((a, b) => b.sales - a.sales).slice(0, 5);
        
        // Inventory Alerts
        const lowStock = allProducts.filter(p => p.quantity > 0 && p.quantity <= 10).map(p => ({
            product: p.name,
            status: 'Low Stock',
            qty: p.quantity,
            urgency: 'medium'
        }));
        const outOfStock = allProducts.filter(p => p.quantity === 0).map(p => ({
            product: p.name,
            status: 'Out of Stock',
            qty: 0,
            urgency: 'high'
        }));
        
        // Dead stock (older than 60 days, 0 sold)
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const deadStock = allProducts.filter(p => p.quantity > 0 && p.createdAt < sixtyDaysAgo && p.sold === 0).map(p => ({
            product: p.name,
            status: 'Dead Stock',
            qty: p.quantity,
            urgency: 'high'
        }));

        const alerts = [...outOfStock, ...deadStock, ...lowStock].slice(0, 10);

        // 5. Customer Experience (Reviews)
        const reviews = await prisma.productReview.findMany({ where: { isApproved: true } });
        const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
        const totalReviews = reviews.length;
        
        const ratingCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        reviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) ratingCounts[r.rating]++;
        });

        // 6. Retention (New vs Returning unique customers)
        const userOrderCounts = new Map<string, number>();
        validOrders.forEach(order => {
            const id = order.userId || order.customerEmail || order.customerPhone || 'unknown';
            if (id !== 'unknown') {
                userOrderCounts.set(id, (userOrderCounts.get(id) || 0) + 1);
            }
        });

        let returningRevenue = 0;
        let newRevenue = 0;
        let returningCustomers = 0;
        let newCustomers = 0;

        // Approximating revenue breakdown by attributing orders grouped by userId/email
        const userRevenueMap = new Map<string, number>();
        validOrders.forEach(order => {
             const id = order.userId || order.customerEmail || order.customerPhone || 'unknown';
             if (id !== 'unknown') {
                 userRevenueMap.set(id, (userRevenueMap.get(id) || 0) + order.total);
             } else {
                 newRevenue += order.total; // unknown users are treated as new/one-off
                 newCustomers += 1;
             }
        });

        userOrderCounts.forEach((count, id) => {
            if (count > 1) {
                returningCustomers++;
                returningRevenue += userRevenueMap.get(id) || 0;
            } else {
                newCustomers++;
                newRevenue += userRevenueMap.get(id) || 0;
            }
        });

        const totalCustomers = newCustomers + returningCustomers;
        const repeatPurchaseRate = totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;
        const clv = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

        return NextResponse.json({
            success: true,
            data: {
                revenue: {
                    totalRevenue,
                    thisMonthRevenue,
                    revenueTarget: settings.monthlyRevenueTarget,
                    aov,
                    refundRate,
                    discountImpact,
                    categoryRevenue: revenueByCategory.sort((a,b) => b.value - a.value).slice(0, 5)
                },
                products: {
                    topProducts: topProductsList,
                    inventoryAlerts: alerts,
                    totalProducts: allProducts.length,
                    activeProducts: allProducts.filter(p => p.quantity > 0).length
                },
                experience: {
                    avgRating,
                    totalReviews,
                    ratingCounts
                },
                retention: {
                    returningRevenue,
                    newRevenue,
                    returningCustomers,
                    newCustomers,
                    repeatPurchaseRate,
                    clv
                }
            }
        });

    } catch (error: any) {
        console.error('DB Analytics API Error:', error);
        return NextResponse.json({
            error: `Failed to fetch DB analytics: ${error.message}`,
            data: null
        }, { status: 500 });
    }
}
