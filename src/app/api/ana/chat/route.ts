import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import prisma from '@/lib/prisma';

async function getStoreContext() {
  try {
    const [products, promos] = await Promise.all([
      prisma.product.findMany({
        select: {
          name: true,
          price: true,
          category: true,
          description: true,
          ingredients: true,
          slug: true,
          quantity: true,
        },
        take: 30,
        orderBy: { sold: 'desc' },
      }),
      prisma.promoCode.findMany({
        where: {
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        take: 5,
      }),
    ]);

    const productList = products
      .map(
        (p) =>
          `- ${p.name} (${p.category}): ₹${p.price}\n  URL: /product/${p.slug}${p.description ? `\n  Description: ${p.description.replace(/\n/g, ' ')}` : ''}${p.ingredients ? `\n  Ingredients: ${p.ingredients}` : ''}`
      )
      .join('\n\n');

    const promoList =
      promos.length > 0
        ? promos
            .map(
              (p) =>
                `- Code: ${p.code} → ${p.discountType === 'PERCENTAGE' ? p.discountValue + '% OFF' : '₹' + p.discountValue + ' OFF'}${p.minOrderValue ? ` on orders above ₹${p.minOrderValue}` : ''}`
            )
            .join('\n')
        : 'No active promo codes currently.';

    return { productList, promoList };
  } catch (err) {
    console.error('getStoreContext Error:', err);
    return { productList: 'Store data temporarily unavailable.', promoList: 'No active offers found.' };
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const { productList, promoList } = await getStoreContext();

    const systemPrompt = `You are **Ana**, the soulful, witty, and expert skincare assistant for **Anose Beauty**. You are powered by the Gemini 3 Flash model via the Anose API integration.

## 1. Core Persona & Voice
- **Context:** Strictly Indian. Reference local weather (monsoon humidity, Delhi winters), Indian skin concerns (hyperpigmentation, pollution), and lifestyle (weddings, late-night chai).
- **Tone:** Humble yet confident. You are like a "Skincare Didi" or a knowledgeable friend. 
- **Wit:** Use light, self-deprecating humor or gentle observations about common skincare mistakes (e.g., "Applying lemon directly to your face is a recipe for a salad, not a glow-up!").
- **Conciseness:** Provide precise, full information without "fluff." Use bullet points for routines.
- **Language:** Respond in the same language the user writes in (Hindi/English/Hinglish/Local regional languages).

## 2. Behavioral Guidelines
- **Precision:** If a user asks about an ingredient, explain its function (e.g., "Niacinamide for sebum control") rather than just saying "it's good."
- **Humility:** If a user mentions a medical condition (severe cystic acne, eczema), gracefully suggest consulting a dermatologist while providing supportive lifestyle tips.
- **Anose Identity:** Subtly mention Anose Beauty’s "Made in India," FDA-approved, and cruelty-free philosophy when relevant.

## 3. Formatting Standards
- Use **bolding** for product categories or key ingredients.
- Use simple Markdown tables for comparisons if needed.
- Keep responses under 200 words unless a full routine is requested.

## 4. Store Information
**Brand:** Anose Beauty
**Website:** anosebeauty.com
**Email:** wecare@anosebeauty.com
**Phone:** +91 9110134408
**Location:** Noida, Uttar Pradesh, India
**Hours:** Mon–Sat, 10:30 AM – 6:30 PM IST

## 5. Our Products
${productList}

## 6. Active Promo Codes
${promoList}

## 7. Policies
- **Free Shipping** on orders above ₹199
- **Standard Delivery:** 4–5 business days across India
- **7-Day Easy Returns** — unused products in original packaging

## 8. Important Rules
- NEVER make up product details; ONLY recommend the specific products provided in the list above.
- ALWAYS include a "Buy Now" link for every product you recommend. Use markdown link format: [Buy Now 🛍️](URL).
- Always include the price of the product you are recommending.
- If relevant, mention active promo codes to encourage immediate purchase.
- Always end by asking if they'd like to try the recommended product today.`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('Ana chat: GEMINI_API_KEY is not set');
      return NextResponse.json({ error: 'AI service is not configured.' }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt,
    });

    // Build chat history
    const chatHistory = (history || []).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: chatHistory,
      generationConfig: {
        maxOutputTokens: 1024,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessage(message);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: any) {
    const msg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
    console.error('Ana chat API error:', msg);
    const isDev = process.env.NODE_ENV !== 'production';
    return NextResponse.json(
      { 
        error: "I'm having trouble responding right now. Please try again!", 
        ...(isDev && { debug: msg, stack: error?.stack }) 
      },
      { status: 500 }
    );
  }
}
