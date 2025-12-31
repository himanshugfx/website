import prisma from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import ProductTabs from "@/components/ProductTabs";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const bestSellers = await prisma.product.findMany({
    take: 8,
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
      {/* Slider Hero */}
      <div className="slider-block style-two bg-linear 2xl:h-[800px] xl:h-[740px] lg:h-[680px] md:h-[580px] sm:h-[500px] h-[420px] w-full">
        <div className="slider-main h-full w-full">
          <div className="relative h-full w-full">
            <div className="container mx-auto h-full flex items-center">
              <div className="text-content sm:w-1/2 w-2/3 z-10">
                <div className="text-sub-display">Sale! Flat 50% Off!</div>
                <div className="text-display md:mt-5 mt-2">Elevate Your Beauty with Our Skin Care Gems</div>
                <div className="body1 mt-4 text-secondary">Check out our latest collection of skincare and haircare products to look confident and beautiful all year round.</div>
                <Link href="/shop" className="button-main md:mt-8 mt-3 inline-block bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 duration-300 shadow-md"> Shop Now</Link>
              </div>
              <div className="sub-img absolute left-0 top-0 w-full h-full z-0">
                <Image
                  src="/assets/images/banner/khushi-banner2.png"
                  alt="Hero Banner"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Block */}
      <div className="banner-block pt-10 px-5">
        <div className="container mx-auto">
          <div className="list-banner grid lg:grid-cols-3 sm:grid-cols-2 gap-[20px]">
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
        bestSellers={bestSellers as any}
        onSale={onSale as any}
        newArrivals={newArrivals as any}
      />

      {/* Benefits */}
      <div className="benefit-block md:py-20 py-10 bg-zinc-50 mt-20">
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
