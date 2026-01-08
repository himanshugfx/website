const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Indian names for reviewers
const indianNames = [
    "Priya Sharma", "Anjali Gupta", "Neha Patel", "Pooja Singh", "Divya Reddy",
    "Sneha Nair", "Kavita Joshi", "Ritu Verma", "Sunita Rao", "Meera Iyer",
    "Ananya Chatterjee", "Shreya Kapoor", "Tanvi Menon", "Ishita Agarwal", "Nandini Das",
    "Shalini Mehta", "Aparna Krishnan", "Deepika Malhotra", "Rekha Pillai", "Swati Deshmukh",
    "Aarti Bhatt", "Komal Sinha", "Pallavi Kumar", "Rashmi Banerjee", "Sonali Mishra"
];

// Review templates by product category
const reviewTemplates = {
    skincare: {
        positive: [
            { title: "Amazing results!", comment: "Been using this for 2 weeks now and my skin feels so much softer. The texture is perfect for Indian weather - not too heavy, absorbs quickly. Definitely worth the price!", rating: 5 },
            { title: "Best purchase ever", comment: "I've tried so many products but nothing worked like this. My skin looks brighter and more even-toned. Even my mother noticed the difference!", rating: 5 },
            { title: "Finally found my skincare match", comment: "As someone with sensitive skin, I was skeptical. But this product is so gentle yet effective. No irritation at all. Will repurchase for sure.", rating: 5 },
            { title: "Perfect for daily use", comment: "Light, non-greasy, and works beautifully under makeup. I use it every morning before office and my skin stays fresh all day.", rating: 5 },
            { title: "Value for money", comment: "At this price point, the quality is exceptional. I was spending 2x on international brands for similar results. Glad I switched to Anose!", rating: 5 },
            { title: "Love the natural ingredients", comment: "I appreciate that this is made with natural ingredients. My skin reacts badly to chemicals but this one is perfect. Thank you Anose!", rating: 5 },
            { title: "Visible difference in one week", comment: "Started seeing results within a week. My dark spots are fading and skin looks more radiant. My friends keep asking what I'm using!", rating: 5 },
            { title: "Great for humid weather", comment: "Living in Chennai, most products feel sticky. This one is perfect for our climate - lightweight and refreshing. Highly recommended!", rating: 5 },
            { title: "My new holy grail", comment: "I've been searching for the perfect product for years. This is it! The consistency, the smell, the results - everything is perfect.", rating: 5 },
            { title: "Impressed with the quality", comment: "The packaging is premium and the product delivers what it promises. My skin has never looked better. 10/10 would recommend.", rating: 5 },
            { title: "Game changer for my skin", comment: "After using this for a month, my skin texture has improved so much. Even my dermatologist complimented me on my skin!", rating: 5 },
            { title: "Suitable for all seasons", comment: "I've used this through summer and winter. Works perfectly in both. My skin stays balanced and hydrated regardless of weather.", rating: 4 },
            { title: "Nice product, good results", comment: "Product quality is really good. Saw improvement within 2 weeks. The only reason for 4 stars is the small quantity for the price.", rating: 4 },
            { title: "Happy with my purchase", comment: "Does what it claims. My skin feels nourished and healthy. Would have given 5 stars if the fragrance was a bit milder.", rating: 4 },
            { title: "Recommended by my beautician", comment: "My beautician suggested Anose products. Now I understand why - the quality is salon-grade but affordable. Very happy!", rating: 5 },
        ],
        neutral: [
            { title: "Good but takes time", comment: "Product is decent quality. Takes about 3-4 weeks to see visible results. If you're patient, it works well. Not a quick fix though.", rating: 3 },
            { title: "Average experience", comment: "It's okay. Nothing extraordinary but not bad either. The product does moisturize but I expected more dramatic results based on the claims.", rating: 3 },
        ]
    },
    haircare: {
        positive: [
            { title: "My hair has never looked better!", comment: "After years of dealing with frizzy hair, this product has been a lifesaver. My hair is smooth, shiny, and manageable. So grateful!", rating: 5 },
            { title: "Reduced hair fall significantly", comment: "I was losing so much hair due to hard water. This shampoo has really helped. Hair fall reduced by at least 50% in one month!", rating: 5 },
            { title: "Smells divine!", comment: "The fragrance is so pleasant and the results are amazing. My hair stays fresh and bouncy for days. Everyone asks what shampoo I use!", rating: 5 },
            { title: "Perfect for Indian hair", comment: "Finally a product that understands Indian hair. It cleanses well without stripping natural oils. My scalp feels healthy and clean.", rating: 5 },
            { title: "Great for colored hair", comment: "I was worried about using new products on my colored hair. This one is gentle and my color hasn't faded at all. Love it!", rating: 5 },
            { title: "Excellent lather and cleansing", comment: "A little goes a long way. The lather is rich and it cleans thoroughly. My oily scalp stays fresh for 2-3 days now!", rating: 5 },
            { title: "Soft and silky hair", comment: "My hair has become so soft after using this. Even without conditioner, my hair doesn't tangle. Best shampoo I've ever used!", rating: 5 },
            { title: "No more dandruff", comment: "I had persistent dandruff problem. After switching to this, it's almost gone completely. Very effective and gentle.", rating: 5 },
            { title: "Worth every rupee", comment: "Initially thought it's expensive but the results justify the price. My hair health has improved dramatically. Money well spent!", rating: 5 },
            { title: "Hotel luxury at home", comment: "This feels like those fancy hotel amenities! Now I know why - Anose supplies to 5-star hotels. Love having this luxury daily!", rating: 5 },
            { title: "Gentle yet effective", comment: "My sensitive scalp usually reacts to harsh shampoos. This one is so gentle but still cleans well. Perfect balance!", rating: 4 },
            { title: "Good product, reasonable price", comment: "Happy with the purchase. Hair feels healthier. Would have preferred a bigger bottle but quality is definitely there.", rating: 4 },
            { title: "Nice for regular use", comment: "Using it daily before office. Hair stays manageable and doesn't get oily quickly. Good for everyday use.", rating: 4 },
            { title: "Recommended!", comment: "My whole family now uses this. Works well for different hair types - my dad's oily hair and my dry hair both benefit.", rating: 5 },
            { title: "Salon-like results at home", comment: "After every wash, my hair looks like I just came from the salon. Smooth, shiny, and fragrant. Absolutely love it!", rating: 5 },
        ],
        neutral: [
            { title: "Decent shampoo", comment: "It's a good shampoo, does the basic job well. But I didn't notice any dramatic transformation like I expected. Maybe I need more time.", rating: 3 },
            { title: "Works okay for me", comment: "Not bad, not amazing. My hair feels clean but the shine and volume claims - I haven't seen much difference honestly.", rating: 3 },
        ]
    },
    sunscreen: {
        positive: [
            { title: "No white cast!", comment: "Finally a sunscreen that doesn't leave white cast on Indian skin! This blends perfectly and doesn't make me look ghostly. Amazing!", rating: 5 },
            { title: "Perfect for oily skin", comment: "I have oily skin and most sunscreens make me look greasy. This one is matte and controls oil. Perfect for Bangalore weather!", rating: 5 },
            { title: "Daily essential now", comment: "I never step out without this. It's lightweight, doesn't pill under makeup, and actually protects. My pigmentation has reduced!", rating: 5 },
            { title: "Great under makeup", comment: "This works beautifully as a makeup base. No pilling, no greasiness. My makeup lasts all day with this underneath.", rating: 5 },
            { title: "Saved my skin!", comment: "After using this regularly for 3 months, my tan has faded and skin tone is more even. Should have started using sunscreen earlier!", rating: 5 },
            { title: "Dermatologist recommended", comment: "My dermatologist suggested SPF 50 and I found Anose. The quality is great and it's so affordable compared to other brands!", rating: 5 },
            { title: "Non-sticky formula", comment: "I hate sticky sunscreens. This one absorbs quickly and doesn't feel heavy at all. Perfect for Indian summers!", rating: 5 },
            { title: "Reapplication is a breeze", comment: "I reapply this over my makeup at lunch and it doesn't mess anything up. So convenient for working women like me!", rating: 5 },
            { title: "Protection you can trust", comment: "Spent a whole day at Goa beach and didn't get tanned! This sunscreen actually works. Everyone else was burned, not me!", rating: 5 },
            { title: "Best affordable sunscreen", comment: "At this price, this quality is unbeatable. I've tried expensive Korean sunscreens but this Indian brand is just as good!", rating: 5 },
            { title: "Lightweight and effective", comment: "Doesn't feel like I'm wearing anything heavy. Yet provides full protection. My skin hasn't tanned at all this summer!", rating: 4 },
            { title: "Good for sensitive skin", comment: "My skin usually reacts to chemical sunscreens. This one is gentle and doesn't cause any breakouts. Quite happy!", rating: 4 },
            { title: "Nice texture", comment: "The texture is creamy but not thick. Spreads easily and absorbs fast. Good everyday sunscreen.", rating: 4 },
            { title: "Must-have for outdoor activities", comment: "I use this for my morning walks and outdoor yoga. Perfect protection without the heaviness!", rating: 5 },
            { title: "Finally a good Indian sunscreen", comment: "We don't need to import expensive sunscreens anymore. This is made in India and works brilliantly. Proud to support!", rating: 5 },
        ],
        neutral: [
            { title: "Works but strong smell", comment: "The product works fine and provides protection. But the fragrance is quite strong for my liking. Wish they had a fragrance-free version.", rating: 3 },
            { title: "Average sunscreen", comment: "It's okay. Does the job but nothing exceptional. The price is fair for what you get. Maybe I expected too much.", rating: 3 },
        ]
    },
    bodywash: {
        positive: [
            { title: "Spa experience at home!", comment: "This body wash makes my shower feel like a spa treatment. The fragrance is so relaxing and my skin feels amazing after!", rating: 5 },
            { title: "Doesn't dry out skin", comment: "Most body washes leave my skin dry and tight. This one is different - my skin feels moisturized even before applying lotion!", rating: 5 },
            { title: "Luxurious lather", comment: "The lather is so rich and creamy. A little amount produces so much foam. Will last for months! Great value for money.", rating: 5 },
            { title: "Hotel quality, home comfort", comment: "I first used Anose products at a 5-star hotel. I was so happy to find I can buy them for home use. Exactly the same quality!", rating: 5 },
            { title: "Best body wash I've used", comment: "I've tried so many brands but this one tops them all. The fragrance lingers on skin for hours. My husband loves it too!", rating: 5 },
            { title: "Perfect for the whole family", comment: "Kids, husband, everyone uses this now. Gentle for kids' skin but effective for adults too. Our family body wash!", rating: 5 },
            { title: "Skin feels so soft", comment: "After just a week of use, my skin feels noticeably softer. The dry patches on my elbows have improved too!", rating: 5 },
            { title: "Lovely natural fragrance", comment: "I love that it smells natural, not artificial. Fresh and clean without being overpowering. Perfect for everyday use!", rating: 5 },
            { title: "Great for Indian climate", comment: "Living in Mumbai, I shower twice daily. This body wash is gentle enough for frequent use and keeps skin healthy.", rating: 5 },
            { title: "Impressed with the quality", comment: "At first I bought it on sale. Now I'm a regular customer even at full price. Quality is consistently excellent!", rating: 5 },
            { title: "Refreshing experience", comment: "The menthol-like cooling effect is perfect for summer. I feel fresh and awake after every shower!", rating: 4 },
            { title: "Good moisturizing properties", comment: "My dry winter skin is so much better with this body wash. Still need lotion but much less than before.", rating: 4 },
            { title: "Nice everyday option", comment: "Good quality, pleasant smell, reasonable price. Does everything a body wash should. Satisfied customer!", rating: 4 },
            { title: "Recommended to all friends", comment: "I've recommended this to so many friends and everyone loves it. Great product from a great Indian brand!", rating: 5 },
            { title: "Premium feel, affordable price", comment: "This could easily cost 3x more based on the quality. So happy to have found an affordable luxury. Thank you Anose!", rating: 5 },
        ],
        neutral: [
            { title: "Good basic body wash", comment: "Does the job well but nothing special. I was expecting more moisturization. It's fine for the price though.", rating: 3 },
            { title: "Fragrance fades quickly", comment: "I love the smell when showering but it doesn't last on skin. Wish the fragrance would linger longer. Product quality is otherwise good.", rating: 3 },
        ]
    },
    facewash: {
        positive: [
            { title: "Best face wash for Indian skin", comment: "Finally a face wash that understands Indian skin! Cleans deeply without drying. My oily T-zone is under control now.", rating: 5 },
            { title: "Gentle yet effective cleansing", comment: "Removes all my makeup and sunscreen without harsh rubbing. My skin feels clean and fresh, not stripped!", rating: 5 },
            { title: "Acne reduced significantly", comment: "I've struggled with acne for years. After using this for 6 weeks, my breakouts have reduced so much. Highly recommend!", rating: 5 },
            { title: "Perfect morning cleanser", comment: "I use this every morning and my skin stays fresh till evening. No more mid-day oiliness. Perfect for working professionals!", rating: 5 },
            { title: "Natural ingredients work wonders", comment: "I appreciate the natural formulation. My skin is sensitive to chemicals but this one has been so kind to my face!", rating: 5 },
            { title: "The beads are so gentle", comment: "Unlike harsh scrubbing beads, these are gentle and don't irritate. Perfect daily exfoliation without damage!", rating: 5 },
            { title: "Brightening effect noticed", comment: "My skin looks brighter and more awake after just 2 weeks. The dullness is gone. So happy with this purchase!", rating: 5 },
            { title: "Controls oil throughout the day", comment: "My face used to get oily within hours. Now it stays matte till evening. This face wash is magic!", rating: 5 },
            { title: "Pores look smaller", comment: "I had large pores on my nose. After using this regularly, they appear much smaller. Clean and refined skin!", rating: 5 },
            { title: "Worth trying!", comment: "Was skeptical at first but now I'm a convert. This is my 3rd bottle and I've already subscribed for more!", rating: 5 },
            { title: "Good for combination skin", comment: "My combination skin is tricky to manage. This balances well - cleans oily parts without drying the dry areas.", rating: 4 },
            { title: "Nice foaming action", comment: "The foam is rich and luxurious. Makes the washing experience pleasant. Skin feels good after use.", rating: 4 },
            { title: "Removes pollution effectively", comment: "After a day in Delhi traffic, this removes all the grime and pollution. Skin feels totally clean and healthy.", rating: 4 },
            { title: "My go-to face wash", comment: "Have been using for 4 months now. Consistent quality and results. Not switching to anything else!", rating: 5 },
            { title: "Amazing for the price", comment: "I used to buy imported face washes. This Indian brand delivers same quality at half the price. Brilliant!", rating: 5 },
        ],
        neutral: [
            { title: "Average results", comment: "It's a decent face wash. Cleans well but I didn't see the brightening effect they claim. Maybe it's just my skin type.", rating: 3 },
            { title: "Works fine for me", comment: "Nothing wrong with it but nothing exceptional either. Does basic cleansing well. Expected more for the hype.", rating: 3 },
        ]
    }
};

// Default reviews for uncategorized products
const defaultReviews = {
    positive: [
        { title: "Excellent product!", comment: "Really impressed with the quality. You can tell this is made with care. Will definitely be repurchasing!", rating: 5 },
        { title: "Great value for money", comment: "At this price point, the quality exceeds expectations. Happy with my purchase!", rating: 5 },
        { title: "Highly recommended", comment: "This has become a staple in my routine. Works exactly as described. Thank you Anose!", rating: 5 },
        { title: "Love it!", comment: "First time trying Anose brand and I'm impressed. The quality is comparable to high-end brands.", rating: 5 },
        { title: "Will buy again", comment: "Very satisfied with this purchase. Works great and the packaging is also nice and sturdy.", rating: 5 },
        { title: "Perfect addition to my routine", comment: "Fits perfectly into my daily routine. Results are visible and I'm very happy!", rating: 5 },
        { title: "Impressed with the quality", comment: "The product quality is top notch. You can feel the difference compared to other brands I've tried.", rating: 5 },
        { title: "My new favorite", comment: "This has replaced my previous product. Better quality and better price. Winner!", rating: 5 },
        { title: "Exactly what I needed", comment: "Does exactly what it claims. No false promises here. Genuine product with real results.", rating: 5 },
        { title: "5 stars deserved", comment: "Everything from ordering to delivery to product quality has been excellent. Very happy customer!", rating: 5 },
        { title: "Good quality product", comment: "Solid product that delivers. Would recommend to family and friends without hesitation.", rating: 4 },
        { title: "Nice product", comment: "Good quality and reasonable price. Happy with my purchase overall.", rating: 4 },
        { title: "Works as expected", comment: "The product does what it promises. Satisfied with the results so far.", rating: 4 },
        { title: "Pleasant experience", comment: "From unboxing to use, everything has been pleasant. Good quality Indian brand!", rating: 5 },
        { title: "Trusted brand now", comment: "Started with one product, now I buy multiple Anose products. Trust built!", rating: 5 },
    ],
    neutral: [
        { title: "It's okay", comment: "Product is decent. Does the job but nothing extraordinary. Average experience overall.", rating: 3 },
        { title: "Mixed feelings", comment: "Some aspects are good, some could be better. Overall it's an okay product for the price.", rating: 3 },
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

function getCategoryFromProduct(product) {
    const name = product.name.toLowerCase();
    const category = product.category.toLowerCase();
    const desc = (product.description || '').toLowerCase();

    if (name.includes('sunscreen') || name.includes('spf') || desc.includes('sun protection')) {
        return 'sunscreen';
    }
    if (name.includes('shampoo') || name.includes('conditioner') || name.includes('hair') || category.includes('hair')) {
        return 'haircare';
    }
    if (name.includes('body wash') || name.includes('body lotion') || name.includes('shower')) {
        return 'bodywash';
    }
    if (name.includes('face wash') || name.includes('facewash') || name.includes('cleanser')) {
        return 'facewash';
    }
    if (name.includes('cream') || name.includes('serum') || name.includes('moistur') || category.includes('skin')) {
        return 'skincare';
    }
    return 'default';
}

async function seedReviews() {
    console.log('Fetching products...');
    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products`);

    const usedNames = new Set();

    for (const product of products) {
        console.log(`\nAdding reviews for: ${product.name}`);

        const category = getCategoryFromProduct(product);
        const templates = reviewTemplates[category] || defaultReviews;

        // Add 10-15 positive reviews
        const positiveCount = 10 + Math.floor(Math.random() * 6); // 10-15
        const positiveReviews = [...templates.positive];

        for (let i = 0; i < positiveCount && positiveReviews.length > 0; i++) {
            const reviewIndex = Math.floor(Math.random() * positiveReviews.length);
            const review = positiveReviews.splice(reviewIndex, 1)[0];

            let name = getRandomElement(indianNames);
            while (usedNames.has(`${product.id}-${name}`) && usedNames.size < indianNames.length * products.length) {
                name = getRandomElement(indianNames);
            }
            usedNames.add(`${product.id}-${name}`);

            await prisma.productReview.create({
                data: {
                    productId: product.id,
                    customerName: name,
                    customerEmail: null,
                    rating: review.rating,
                    title: review.title,
                    comment: review.comment,
                    isVerified: Math.random() > 0.3, // 70% verified
                    isApproved: true,
                    createdAt: getRandomDate()
                }
            });
        }

        // Add 1-2 neutral reviews
        const neutralCount = 1 + Math.floor(Math.random() * 2); // 1-2
        const neutralReviews = [...templates.neutral];

        for (let i = 0; i < neutralCount && neutralReviews.length > 0; i++) {
            const reviewIndex = Math.floor(Math.random() * neutralReviews.length);
            const review = neutralReviews.splice(reviewIndex, 1)[0];

            let name = getRandomElement(indianNames);
            while (usedNames.has(`${product.id}-${name}`)) {
                name = getRandomElement(indianNames);
            }
            usedNames.add(`${product.id}-${name}`);

            await prisma.productReview.create({
                data: {
                    productId: product.id,
                    customerName: name,
                    customerEmail: null,
                    rating: review.rating,
                    title: review.title,
                    comment: review.comment,
                    isVerified: Math.random() > 0.5, // 50% verified
                    isApproved: true,
                    createdAt: getRandomDate()
                }
            });
        }

        console.log(`  Added ${positiveCount} positive + ${neutralCount} neutral reviews`);
    }

    console.log('\n✅ Review seeding completed!');
}

seedReviews()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
