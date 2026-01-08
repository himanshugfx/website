const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Indian names for reviewers
const indianNames = [
    "Priya Sharma", "Anjali Gupta", "Neha Patel", "Pooja Singh", "Divya Reddy",
    "Sneha Nair", "Kavita Joshi", "Ritu Verma", "Sunita Rao", "Meera Iyer",
    "Ananya Chatterjee", "Shreya Kapoor", "Tanvi Menon", "Ishita Agarwal", "Nandini Das",
    "Shalini Mehta", "Aparna Krishnan", "Deepika Malhotra", "Rekha Pillai", "Swati Deshmukh"
];

// Facewash specific reviews (herbal focus)
const herbalFacewashReviews = {
    positive: [
        { title: "Love the herbal formula!", comment: "This herbal face wash is amazing! My skin feels so clean and fresh after every use. The natural ingredients really make a difference.", rating: 5 },
        { title: "Perfect for sensitive skin", comment: "I have very sensitive skin and most face washes cause irritation. This herbal one is so gentle yet effective. No redness at all!", rating: 5 },
        { title: "Natural ingredients work wonders", comment: "Finally a face wash with real herbal ingredients that actually work. My skin looks brighter and feels healthier. So happy!", rating: 5 },
        { title: "Best for daily use", comment: "Using this morning and night. The herbal fragrance is soothing and my skin never feels dry or tight after washing.", rating: 5 },
        { title: "Cleared my acne naturally", comment: "I was struggling with hormonal acne. After 3 weeks of using this herbal face wash, my breakouts have reduced significantly!", rating: 5 },
        { title: "Gentle cleansing power", comment: "Removes all my makeup and dirt without harsh chemicals. The herbal formula is kind to my skin. Highly recommend!", rating: 5 },
        { title: "Ayurvedic goodness", comment: "Love that this has traditional herbal ingredients. My grandmother always said natural is best - she was right! Great product.", rating: 5 },
        { title: "No more oily skin", comment: "My oily T-zone used to be a nightmare. This herbal face wash controls oil naturally without over-drying. Perfect balance!", rating: 5 },
        { title: "Refreshing herbal scent", comment: "The natural herbal fragrance is so calming. Makes my morning routine feel like a spa experience. Skin feels amazing!", rating: 5 },
        { title: "Worth every rupee", comment: "Affordable herbal face wash that actually delivers. My skin texture has improved so much. Will definitely repurchase!", rating: 5 },
        { title: "Great for Indian climate", comment: "Living in humid Chennai, I need something that cleanses well. This herbal formula is perfect for our weather!", rating: 5 },
        { title: "My whole family uses it", comment: "Bought one for myself, now everyone at home uses it. Safe for all skin types and age groups. Great family product!", rating: 5 },
        { title: "Pores look cleaner", comment: "My blackheads and clogged pores have reduced noticeably. The herbal ingredients seem to deep clean naturally.", rating: 4 },
        { title: "Good for pollution protection", comment: "After coming home from Delhi pollution, this removes all the grime effectively. Skin feels purified and clean!", rating: 4 },
        { title: "Nice everyday cleanser", comment: "Solid face wash with good herbal ingredients. Does the job well. Skin feels fresh and healthy after use.", rating: 4 },
    ],
    neutral: [
        { title: "Decent product", comment: "The face wash is okay. Cleans well but I expected more dramatic results from the herbal ingredients. It's fine for daily use.", rating: 3 },
        { title: "Works but slow results", comment: "Using it for a month now. Results are gradual, not instant. The product is gentle though. Maybe need more patience.", rating: 3 },
    ]
};

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomDate() {
    const start = new Date('2025-06-01');
    const end = new Date('2026-01-05');
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function fixHerbalFacewashReviews() {
    console.log('Finding Herbal Facewash products...');

    const herbalProducts = await prisma.product.findMany({
        where: {
            name: { contains: 'Herbal Facewash' }
        }
    });

    console.log(`Found ${herbalProducts.length} Herbal Facewash products`);

    for (const product of herbalProducts) {
        console.log(`\nFixing reviews for: ${product.name}`);

        // Delete existing reviews
        const deleted = await prisma.productReview.deleteMany({
            where: { productId: product.id }
        });
        console.log(`  Deleted ${deleted.count} old reviews`);

        const usedNames = new Set();

        // Add 10-15 positive reviews
        const positiveCount = 10 + Math.floor(Math.random() * 6);
        const positiveReviews = [...herbalFacewashReviews.positive];

        for (let i = 0; i < positiveCount && positiveReviews.length > 0; i++) {
            const reviewIndex = Math.floor(Math.random() * positiveReviews.length);
            const review = positiveReviews.splice(reviewIndex, 1)[0];

            let name = getRandomElement(indianNames);
            while (usedNames.has(name) && usedNames.size < indianNames.length) {
                name = getRandomElement(indianNames);
            }
            usedNames.add(name);

            await prisma.productReview.create({
                data: {
                    productId: product.id,
                    customerName: name,
                    customerEmail: null,
                    rating: review.rating,
                    title: review.title,
                    comment: review.comment,
                    isVerified: Math.random() > 0.3,
                    isApproved: true,
                    createdAt: getRandomDate()
                }
            });
        }

        // Add 1-2 neutral reviews
        const neutralCount = 1 + Math.floor(Math.random() * 2);
        const neutralReviews = [...herbalFacewashReviews.neutral];

        for (let i = 0; i < neutralCount && neutralReviews.length > 0; i++) {
            const reviewIndex = Math.floor(Math.random() * neutralReviews.length);
            const review = neutralReviews.splice(reviewIndex, 1)[0];

            let name = getRandomElement(indianNames);
            while (usedNames.has(name)) {
                name = getRandomElement(indianNames);
            }
            usedNames.add(name);

            await prisma.productReview.create({
                data: {
                    productId: product.id,
                    customerName: name,
                    customerEmail: null,
                    rating: review.rating,
                    title: review.title,
                    comment: review.comment,
                    isVerified: Math.random() > 0.5,
                    isApproved: true,
                    createdAt: getRandomDate()
                }
            });
        }

        console.log(`  Added ${positiveCount} positive + ${neutralCount} neutral reviews`);
    }

    console.log('\n✅ Herbal Facewash reviews fixed!');
}

fixHerbalFacewashReviews()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
