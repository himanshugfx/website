import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getAdminContext() {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Last 6 months range
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(now.getMonth() - 6);

    const [
      revenueData,
      orderCount,
      pendingOrders,
      lowStockProducts,
      expenseData,
      unpaidInvoices,
      leadCount,
      topProducts,
      recentInvoices,
      expenseCategories
    ] = await Promise.all([
      // Revenue (Total and Month)
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: { status: 'PAID' }
      }),
      // Total Orders
      prisma.order.count(),
      // Pending Orders
      prisma.order.count({ where: { status: 'PENDING' } }),
      // Low Stock
      prisma.product.findMany({
        where: { quantity: { lt: 10 } },
        select: { name: true, quantity: true },
        take: 10
      }),
      // Expenses this month
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: firstDayOfMonth } }
      }),
      // Unpaid Invoices
      prisma.invoice.findMany({
        where: { 
          status: { in: ['SENT', 'OVERDUE', 'PARTIALLY_PAID'] } 
        },
        select: { invoiceNumber: true, total: true, balance: true, customerName: true },
        take: 10
      }),
      // Leads
      prisma.lead.count(),
      // Top Products by Sales
      prisma.product.findMany({
        orderBy: { sold: 'desc' },
        select: { name: true, sold: true, price: true },
        take: 5
      }),
      // Recent Invoices for trend analysis
      prisma.invoice.findMany({
        where: { 
          invoiceDate: { gte: sixMonthsAgo },
          status: 'PAID'
        },
        select: { total: true, invoiceDate: true },
        orderBy: { invoiceDate: 'asc' }
      }),
      // Expense categories
      prisma.expense.groupBy({
        by: ['category'],
        _sum: { amount: true },
        where: { date: { gte: firstDayOfMonth } }
      })
    ]);

    const totalRevenue = revenueData._sum.total || 0;
    const monthlyExpenses = expenseData._sum.amount || 0;

    // Process Revenue Trend (Group by Month)
    const monthlyTrend: Record<string, number> = {};
    recentInvoices.forEach(inv => {
      const monthYear = inv.invoiceDate.toLocaleString('en-IN', { month: 'short', year: '2-digit' });
      monthlyTrend[monthYear] = (monthlyTrend[monthYear] || 0) + inv.total;
    });
    const salesTrendStr = Object.entries(monthlyTrend)
      .map(([month, total]) => `${month}: ₹${total.toLocaleString('en-IN')}`)
      .join(', ');

    const lowStockList = lowStockProducts.length > 0
      ? lowStockProducts.map(p => `- ${p.name}: ${p.quantity} units left`).join('\n')
      : 'All products are well-stocked.';

    const pendingInvoicesList = unpaidInvoices.length > 0
      ? unpaidInvoices.map(i => `- ${i.invoiceNumber} (${i.customerName}): ₹${i.balance} pending`).join('\n')
      : 'No pending invoices.';

    const topProductsList = topProducts.map(p => `- ${p.name}: ${p.sold} units sold`).join('\n');
    
    const expenseBreakdown = expenseCategories.map(c => `- ${c.category}: ₹${c._sum.amount?.toLocaleString('en-IN')}`).join('\n');

    return {
      totalRevenue,
      orderCount,
      pendingOrders,
      lowStockList,
      monthlyExpenses,
      pendingInvoicesList,
      leadCount,
      salesTrendStr,
      topProductsList,
      expenseBreakdown
    };
  } catch (err) {
    console.error('getAdminContext Error:', err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, history } = await req.json();
    const adminData = await getAdminContext();

    if (!adminData) {
      return NextResponse.json({ error: 'Failed to fetch admin data context' }, { status: 500 });
    }

    const systemPrompt = `You are **Ana Admin**, the expert business analyst and administrative assistant for **Anose Beauty**. 
You are speaking to the store administrator in the private Admin Dashboard. Your job is to provide clear, actionable insights based on the live data provided below.

## 1. Store Analytics Overview
- **Total Revenue (Paid Invoices):** ₹${adminData.totalRevenue.toLocaleString('en-IN')}
- **Lifetime Orders:** ${adminData.orderCount}
- **Pending Orders requiring action:** ${adminData.pendingOrders}
- **Total Leads in Funnel:** ${adminData.leadCount}
- **Expenses (Current Month):** ₹${adminData.monthlyExpenses.toLocaleString('en-IN')}

## 2. Monthly Sales Trend (Last 6 Months):
${adminData.salesTrendStr || 'Insufficient historical data for trend analysis.'}

## 3. Top Selling Products:
${adminData.topProductsList}

## 4. Inventory Alerts (Low Stock < 10 units):
${adminData.lowStockList}

## 5. Pending Payments (Invoices):
${adminData.pendingInvoicesList}

## 6. Expense Breakdown (Current Month):
${adminData.expenseBreakdown || 'No expenses recorded this month.'}

## 7. Persona & Voice
- **Tone:** Professional, efficient, and proactive. You are a business partner.
- **Goal:** Help the admin manage the store. Identify trends (e.g., "Sales have grown 20% since last month") and problems (low stock).
- **Directness:** Give the numbers and the "why" behind them.
- **Language:** Stick to the user's language (English/Hindi/Hinglish).
- **Guidelines:** If asked about "Sales," provide a detailed month-wise breakdown using the trend data. Always offer to help with a specific task.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured' }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
    });

    const chatHistory = (history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: chatHistory });
    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Ana Admin API Error:', error);
    return NextResponse.json({ 
      error: 'Something went wrong while thinking...',
      debug: error.message 
    }, { status: 500 });
  }
}
