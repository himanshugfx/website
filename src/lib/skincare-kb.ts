export interface SkincareIntent {
    keywords: string[];
    title: string;
    advice: string;
    searchTerms: string;
}

export const SKINCARE_KB: Record<string, SkincareIntent> = {
    acne: {
        keywords: ["acne", "pimple", "zits", "breakout", "blackhead", "whitehead"],
        title: "Treating Acne-Prone Skin",
        advice: "Acne is often caused by excess oil and bacteria. Use a **Salicylic Acid** based cleanser to deeply clean pores. Avoid heavy oils and always use non-comedogenic products. Spot treat active breakouts and don't pick at them!",
        searchTerms: "acne facewash serum"
    },
    dryness: {
        keywords: ["dry", "flaky", "dehydrated", "rough", "tightness"],
        title: "Hydration Guide for Dry Skin",
        advice: "Dry skin needs moisture-locking ingredients. Look for **Hyaluronic Acid** and **Glycerin** to pull moisture in, and **Ceramides** to keep it there. Avoid harsh sulfates that strip your skin's natural oils.",
        searchTerms: "moisturizer dry skin hyaluronic"
    },
    oily: {
        keywords: ["oily", "greasy", "shiny", "sebum", "large pores"],
        title: "Balance Your Oily Skin",
        advice: "Even oily skin needs hydration! Use a lightweight, gel-based moisturizer. **Niacinamide** is great for regulating oil production. Double cleansing at night can help remove all surface oil and impurities.",
        searchTerms: "oily skin facewash niacinamide"
    },
    aging: {
        keywords: ["aging", "wrinkles", "fine lines", "sagging", "mature"],
        title: "Anti-Aging Skincare Routine",
        advice: "Start with a consistent **SPF** routine—sun damage is the #1 cause of aging. Incorporate **Retinol** or **Bakuchiol** into your nighttime routine to boost collagen. Antioxidants like **Vitamin C** help brighten and protect.",
        searchTerms: "aging retinol serum spf"
    },
    pigmentation: {
        keywords: ["dark spots", "pigmentation", "uneven tone", "sun spots", "blemishes", "scars"],
        title: "Brightening & Pigmentation",
        advice: "Fading pigmentation takes time and protection. **Vitamin C**, **Kojic Acid**, and **Niacinamide** are effective. Most importantly, wear **Sunscreen** daily to prevent spots from getting darker.",
        searchTerms: "pigmentation vitamin c serum"
    },
    sensitive: {
        keywords: ["sensitive", "redness", "irritated", "burning", "stinging", "itching"],
        title: "Soothing Sensitive Skin",
        advice: "Stick to the basics: a gentle cleanser and a soothing moisturizer. Look for **Centella Asiatica (Cica)**, **Aloe Vera**, and **Oat** extracts. Always patch test new products before full application.",
        searchTerms: "sensitive skin gentle cleanser"
    },
    haircare: {
        keywords: ["hair fall", "dandruff", "frizzy hair", "hair growth", "damaged hair"],
        title: "Hair Health & Care",
        advice: "Healthy hair starts at the scalp. Use a clarifying shampoo for dandruff and follow up with a nourishing oil or mask. Avoid excessive heat styling and use a heat protectant when you do.",
        searchTerms: "hair oil shampoo hair care"
    }
};

export const detectIntent = (input: string): SkincareIntent | null => {
    const lowerInput = input.toLowerCase();

    // Try to find a match where at least one keyword is present
    for (const key in SKINCARE_KB) {
        const intent = SKINCARE_KB[key];
        if (intent.keywords.some(k => lowerInput.includes(k))) {
            return intent;
        }
    }

    return null;
};
