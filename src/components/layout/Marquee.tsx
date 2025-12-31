'use client';

export default function Marquee() {
    const items = [
        "Get 50% off on all products",
        "Free shipping on all orders over ₹199",
        "Get 50% off on all products",
        "Free shipping on all orders over ₹199",
        "Get 50% off on all products",
        "Free shipping on all orders over ₹199",
        "Get 50% off on all products",
        "Free shipping on all orders over ₹199",
        "Get 50% off on all products",
        "Free shipping on all orders over ₹199",
    ];

    return (
        <div className="banner-top bg-purple w-full py-3 overflow-hidden">
            <div className="marquee flex whitespace-nowrap animate-marquee">
                {items.map((item, index) => (
                    <div key={index} className="text-button-uppercase px-8">
                        {item}
                    </div>
                ))}
                {/* Duplicate for seamless loop */}
                {items.map((item, index) => (
                    <div key={`dup-${index}`} className="text-button-uppercase px-8">
                        {item}
                    </div>
                ))}
            </div>
            <style jsx>{`
        .animate-marquee {
          display: flex;
          animation: marquee 20s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
        </div>
    )
}
