export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";

import ProductTabs from "@/components/ProductTabs";
import Image from "next/image";
import Link from "next/link";
import type { ProductCardProduct } from "@/components/ProductCard";

export default async function Home() {
  const bestSellers = await prisma.product.findMany({
    take: 8,
    where: { bestSeller: true },
    orderBy: { sold: 'desc' },
  });


  const onSale = await prisma.product.findMany({
    take: 8,
    where: { sale: true },
    orderBy: { createdAt: 'desc' },
  });

  const newArrivals = await prisma.product.findMany({
    take: 8,
    where: { new: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main>
      {/* Slider Hero - Enhanced */}
      <div className="slider-block style-two relative bg-zinc-900 2xl:h-[800px] xl:h-[740px] lg:h-[680px] md:h-[580px] sm:h-[500px] h-[450px] w-full overflow-hidden">
        <div className="slider-main h-full w-full relative z-10">
          <div className="container mx-auto h-full px-6 flex items-center">
            <div className="text-content sm:w-1/2 w-full animate-fade-in">
              <div className="inline-block px-4 py-1.5 rounded-full bg-purple-600/90 text-white text-xs font-bold tracking-[0.2em] mb-6 uppercase shadow-lg shadow-purple-500/20">
                New Arrivals • 2026
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tighter italic uppercase">
                Sale! Flat <span className="text-purple-400">50% Off!</span>
              </h1>
              <p className="text-lg md:text-xl text-zinc-300 mb-8 max-w-lg leading-relaxed font-medium">
                Use code <span className="text-white font-bold bg-white/10 px-2 py-1 rounded">NEWYEAR</span> to unlock exclusive discounts on our premium skincare collection.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/shop" className="group bg-purple-600 hover:bg-purple-700 text-white px-10 py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-all shadow-xl shadow-purple-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/40 flex items-center gap-3">
                  Shop Now
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
                <Link href="/amenities" className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-xl font-bold uppercase text-sm tracking-widest transition-all flex items-center">
                  Explore Amenities
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/assets/images/banner/khushi-banner.png"
            alt="Hero Banner"
            fill
            className="object-cover brightness-75 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Decorative Blur Elements */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-50 left-[40%] w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Banner Block */}
      <div className="banner-block mt-16 md:mt-24 md:py-20 py-10 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="list-banner grid lg:grid-cols-3 sm:grid-cols-2 gap-6">
            {[
              { title: "Skin Care", img: "/assets/images/banner/18.png" },
              { title: "Hair Care", img: "/assets/images/banner/19.png" },
              { title: "Travel Kits", img: "/assets/images/banner/20.png" },
            ].map((banner, i) => (
              <Link key={i} href="/shop" className="banner-item relative bg-surface block rounded-[20px] overflow-hidden group">
                <div className="banner-img w-full transition-transform duration-500 group-hover:scale-105">
                  <img src={banner.img} alt={banner.title} className="w-full" />
                </div>
                <div className="banner-content absolute left-[30px] bottom-[30px]">
                  <div className="heading4 text-white">{banner.title}</div>
                  <div className="text-button text-white relative inline-block pb-1 border-b-2 border-white mt-2 transition-all group-hover:border-transparent"> Shop Now</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>


      {/* Product Tabs: Best Sellers, On Sale, New Arrivals */}
      <ProductTabs
        bestSellers={bestSellers as ProductCardProduct[]}
        onSale={onSale as ProductCardProduct[]}
        newArrivals={newArrivals as ProductCardProduct[]}
      />

      {/* Benefits */}
      <div className="benefit-block mt-16 md:mt-24 md:py-20 py-10 bg-zinc-50">
        <div className="container mx-auto">
          <div className="list-benefit grid items-start md:grid-cols-3 grid-cols-1 gap-10">
            <div className="benefit-item flex flex-col items-center text-center">
              <i className="icon-double-leaves text-6xl text-green-600"></i>
              <div className="body1 font-semibold uppercase mt-5">100% ORGANIC</div>
              <div className="caption1 text-secondary mt-2">We believe in skin that looks like skin and radiance that come naturally</div>
            </div>
            <div className="benefit-item flex flex-col items-center text-center">
              <i className="icon-leaves text-6xl text-green-600"></i>
              <div className="body1 font-semibold uppercase mt-5">NO SYNTHETIC COLORS</div>
              <div className="caption1 text-secondary mt-2">With transparency as our guide and color as our vehicle conventions</div>
            </div>
            <div className="benefit-item flex flex-col items-center text-center">
              <i className="icon-rabbit-heart text-6xl text-green-600"></i>
              <div className="body1 font-semibold uppercase mt-5">NO ANIMAL TESTING</div>
              <div className="caption1 text-secondary mt-2">Our products are cruelty-free and never tested on animals</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
