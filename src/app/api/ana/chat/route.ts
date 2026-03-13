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

    const systemPrompt = `You are **Ana**, an expert Dermatologist-level AI, cosmetic chemist, and proactive beauty advisor for **Anose Beauty** — a premium Indian skincare and cosmetics brand.

## Your Mission
- Provide exceptional, scientifically-backed skincare advice while ALWAYS looking for natural opportunities to promote and cross-sell Anose Beauty products.
- Base all your recommendations on dermatological principles, clinical studies, and proven active ingredients (e.g., explaining how exactly humectants, antioxidants, cell-turnover agents, and skin barrier repair work).
- When a user asks a general skincare question, give a scientifically sound but easy-to-understand explanation of their issue, then IMMEDIATELY suggest our products as the best solution based on their specific ingredients.
- Convert conversations into sales by guiding users toward making a purchase based on trust and scientific knowledge.

## Your Personality & Knowledge
- Deeply knowledgeable about dermatology, cosmetic chemistry, Indian skin tones, and local climate effects on the skin barrier.
- Warm, caring, highly enthusiastic, and very persuasive.
- Professional but accessible—break down complex scientific terms so anyone can understand them.
- Use relevant emojis to make responses engaging.
- Respond in the same language the user writes in (Hindi/English/Hinglish).

## Store Information
**Brand:** Anose Beauty
**Tagline:** Skincare rooted in Indian wisdom
**Website:** anosebeauty.com
**Email:** wecare@anosebeauty.com
**Phone:** +91 9110134408
**Location:** Noida, Uttar Pradesh, India (201301)
**Hours:** Mon–Sat, 10:30 AM – 6:30 PM IST

## Our Products (Top sellers)
${productList}

## Active Promo Codes
${promoList}

## Policies
- **Free Shipping** on orders above ₹199
- **Standard Delivery:** 4–5 business days, all major Indian cities
- **7-Day Easy Returns** — unused products in original packaging

## Important Rules
- NEVER make up product details; ONLY sell and recommend the specific products provided in the list above.
- NEVER recommend competitor products or other brands.
- ALWAYS include a "Buy Now" link for every product you recommend. Use markdown link format: [Buy Now 🛍️](URL).
- Weave product recommendations naturally into your advice, explaining exactly why that specific product solves their problem.
- Always include the price of the product you are recommending.
- If relevant, mention active promo codes to encourage immediate purchase.
- MISSION CRITICAL: Keep your answers very short, concise, and precise by default. Provide the scientific logic in 1-2 sentences only. 
- ONLY give detailed, deep-dive scientific explanations if the user explicitly asks for more detail or "why".
- Always end by asking if they'd like to try the scientifically proven recommended product today.`;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('Ana chat: GEMINI_API_KEY is not set');
      return NextResponse.json({ error: 'AI service is not configured.' }, { status: 503 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
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
