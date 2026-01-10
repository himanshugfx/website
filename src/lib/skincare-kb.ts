export interface SkincareIntent {
    keywords: string[];
    title: string;
    advice: string;
    searchTerms: string;
}

export const SKINCARE_KB: Record<string, SkincareIntent> = {
    basics: {
        keywords: ["routine", "basics", "daily skin care", "how to start", "skincare steps", "beginner"],
        title: "Skincare Basics 101",
        advice: "A perfect routine has 3 core steps: 1. **Cleanse** (use a gentle facewash), 2. **Moisturize** (keep skin hydrated), and 3. **Protect** (SPF 50+ is non-negotiable every morning). Start simple and let your skin adjust!",
        searchTerms: "facewash moisturizer sunscreen"
    },
    glow_general: {
        keywords: ["glowing", "radiant", "radiance", "brighten skin", "dull skin", "how to glow"],
        title: "The Secret to Glowing Skin",
        advice: "True radiance comes from: \n1. **Internal Hydration**: Drink 2-3L water.\n2. **Gentle Exfoliation**: Use AHAs/BHAs once a week.\n3. **Vitamin C**: A daily serum brightens dullness.\n4. **Sun Protection**: Prevents dullness caused by UV rays. \nConsistency is your best friend!",
        searchTerms: "vitamin c serum saffron facewash"
    },
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
    },
    // Home Remedies
    glow_remedy: {
        keywords: ["glow", "brighten", "radiance", "home remedy for glow", "face pack"],
        title: "Natural Glow Home Remedy",
        advice: "For an instant glow, try this: Mix **1 tbsp Besan (Gram Flour)**, **a pinch of Turmeric**, and **1 tbsp Curd (Yogurt)**. Apply for 15 mins and wash off. This traditional 'Ubtan' helps exfoliate and brighten naturally!",
        searchTerms: "saffron face wash glow"
    },
    tan_remedy: {
        keywords: ["tan", "sunburn", "de-tan", "burnt skin", "remove tan"],
        title: "De-Tan Home Remedy",
        advice: "To remove tan, mix **Potato Juice** with a few drops of **Lemon**. Apply on tanned areas for 20 mins. Potato acts as a natural bleach, and Vitamin C in lemon helps brighten.",
        searchTerms: "aloe vera gel sunscreen"
    },
    dark_circles_remedy: {
        keywords: ["dark circles", "puffy eyes", "tired eyes", "under eye"],
        title: "Home Remedy for Dark Circles",
        advice: "Soothe tired eyes with **Cold Cucumber slices** or **Chilled Green Tea bags** for 10-15 mins. Massaging a drop of **Almond Oil** under your eyes every night also helps lighten dark circles over time.",
        searchTerms: "under eye cream serum"
    },
    oily_remedy: {
        keywords: ["multani mitti", "clay mask", "greasy skin help", "natural oily skin"],
        title: "Home Remedy for Oily Skin",
        advice: "Use **Multani Mitti (Fuller's Earth)** mixed with **Rose Water**. This traditional clay mask absorbs excess oil and tightens pores without over-drying. Use it once or twice a week.",
        searchTerms: "multani mitti face wash"
    }
};

export const detectIntent = (input: string): SkincareIntent | null => {
    const lowerInput = input.toLowerCase();

    // Priority 1: Exact or longer keyword matches first
    // This helps differentiate between "glow" (general) and "home remedy for glow" (remedy)
    let bestMatch: SkincareIntent | null = null;
    let maxKeywordLength = 0;

    for (const key in SKINCARE_KB) {
        const intent = SKINCARE_KB[key];
        for (const keyword of intent.keywords) {
            if (lowerInput.includes(keyword)) {
                if (keyword.length > maxKeywordLength) {
                    maxKeywordLength = keyword.length;
                    bestMatch = intent;
                }
            }
        }
    }

    return bestMatch;
};
