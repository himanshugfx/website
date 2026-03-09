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
          `- ${p.name} (${p.category}): ₹${p.price}${p.ingredients ? `, Ingredients: ${p.ingredients.substring(0, 120)}` : ''}`
      )
      .join('\n');

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

    const systemPrompt = `You are **Ana**, the friendly and knowledgeable AI beauty assistant for **Anose Beauty** — a premium Indian skincare and cosmetics brand.

## Your Personality
- Warm, caring, and enthusiastic about skincare
- Knowledgeable about Indian skin tones, climate, and beauty traditions
- Always respond in a helpful, concise, and friendly manner
- Use relevant emojis to make responses engaging
- Respond in the same language the user writes in (Hindi/English/Hinglish)

## Store Information
**Brand:** Anose Beauty
**Tagline:** Skincare rooted in Indian wisdom
**Website:** anosebeauty.com
**Email:** wecare@anosebeauty.com
**Phone:** +91 9110134408
**Location:** Noida, Uttar Pradesh, India (201301)
**Hours:** Mon–Sat, 10:30 AM – 6:30 PM IST
**Instagram:** @anosebeauty

## Our Products (Top sellers)
${productList}

## Active Promo Codes
${promoList}

## Policies
- **Free Shipping** on orders above ₹199
- **Standard Delivery:** 4–5 business days, all major Indian cities
- **7-Day Easy Returns** — unused products in original packaging
- Refunds processed within 5–7 business days after quality check
- For damaged items, contact within 48 hours with unboxing video/photos

## What You Can Help With
1. **Product recommendations** based on skin type, concern, or budget
2. **Skincare advice** — routines, ingredient info, Indian home remedies
3. **Order tracking** — guide users to check their order status
4. **Promo codes** — share current active discount codes
5. **Policies** — shipping, return, refund policies
6. **General beauty/skincare Q&A**

## Important Rules
- NEVER make up product details; only use the product list provided above
- If asked about order status, ask for their order number or phone, then tell them to check their email or contact support
- Keep answers concise (under 200 words unless detailed skincare advice is needed)
- Always end with a helpful follow-up question or suggestion when appropriate
- Do NOT reveal competitor product names or recommend other brands
- If you don't know something, politely say so and offer to connect them with human support`;

    const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCUxoqwy7dw4p1YzJfL1JFxWHgOxJkFgek';

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
        maxOutputTokens: 512,
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
