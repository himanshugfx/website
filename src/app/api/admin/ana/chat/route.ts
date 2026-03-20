import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getAdminContext() {
  try {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      revenueData,
      orderCount,
      pendingOrders,
      lowStockProducts,
      expenseData,
      unpaidInvoices,
      leadCount
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
      prisma.lead.count()
    ]);

    const totalRevenue = revenueData._sum.total || 0;
    const monthlyExpenses = expenseData._sum.amount || 0;

    const lowStockList = lowStockProducts.length > 0
      ? lowStockProducts.map(p => `- ${p.name}: ${p.quantity} units left`).join('\n')
      : 'All products are well-stocked.';

    const pendingInvoicesList = unpaidInvoices.length > 0
      ? unpaidInvoices.map(i => `- ${i.invoiceNumber} (${i.customerName}): ₹${i.balance} pending`).join('\n')
      : 'No pending invoices.';

    return {
      totalRevenue,
      orderCount,
      pendingOrders,
      lowStockList,
      monthlyExpenses,
      pendingInvoicesList,
      leadCount
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

## 2. Inventory Alerts (Low Stock < 10 units):
${adminData.lowStockList}

## 3. Pending Payments (Invoices):
${adminData.pendingInvoicesList}

## 4. Persona & Voice
- **Tone:** Professional, efficient, and proactive. You are a business partner.
- **Goal:** Help the admin manage the store. Identify problems (low stock, unpaid invoices) before they are asked about.
- **Directness:** Don't use "fluff." Give the numbers first.
- **Language:** Stick to the user's language (English/Hindi/Hinglish).

## 5. Security & Privacy
- You have access to sensitive financial data. Only share this data when relevant to the user's question.
- Do NOT share this data with regular customers (though this API is protected, always maintain your professional admin persona).

## 6. Guidelines
- If asked about "Sales," refer to the Total Revenue.
- If asked about "Work to do," highlight Pending Orders and Pending Invoices.
- If asked about "Inventory," refer to the Low Stock list.
- Always offer to help with a specific task (e.g., "Would you like me to draft a reminder for the pending invoices?").`;

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
