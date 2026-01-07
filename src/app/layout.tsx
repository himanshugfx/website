import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Marquee from "@/components/layout/Marquee";
import AuthProvider from "@/components/layout/Provider";
import Script from "next/script";
import CartPopup from "@/components/CartPopup";
import { SpeedInsights } from "@vercel/speed-insights/next"
import ConditionalWrapper from "@/components/layout/ConditionalWrapper";
import { Analytics } from "@vercel/analytics/next"
import PageViewTracker from "@/components/PageViewTracker";
import AdminAutoLogout from "@/components/layout/AdminAutoLogout";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Anose - Premium Cosmetics & Hotel Amenities Manufacturer",
    template: "%s | Anose"
  },
  description: "Anose is a leading premium cosmetic manufacturer and luxury hotel amenities supplier. Explore our organic skincare, hair care, and travel kits crafted for excellence.",
  keywords: ["premium cosmetics", "hotel amenities supplier", "organic skincare", "cosmetic manufacturer India", "luxury bath products", "private label cosmetics"],
  authors: [{ name: "Anose Team" }],
  creator: "Anose",
  publisher: "Anose",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Anose - Premium Cosmetics & Hotel Amenities",
    description: "Discover high-quality organic skincare and premium hotel amenities from Anose.",
    url: "https://anose.in",
    siteName: "Anose",
    images: [
      {
        url: "/assets/images/banner/khushi-banner.png",
        width: 1200,
        height: 630,
        alt: "Anose Premium Skincare",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Anose - Premium Cosmetics",
    description: "Transform your skincare routine with Anose's premium organic products.",
    images: ["/assets/images/banner/khushi-banner.png"],
  },
  icons: {
    icon: "/assets/images/fav.png",
    shortcut: "/assets/images/fav.png",
    apple: "/assets/images/fav.png",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://anose.in",
  }
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Anose",
  "url": "https://anose.in",
  "logo": "https://anose.in/assets/images/fav.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+91-XXXXXXXXXX",
    "contactType": "customer service",
    "availableLanguage": ["en", "Hindi"]
  },
  "sameAs": [
    "https://www.facebook.com/AnoseBeauty",
    "https://www.instagram.com/anosebeauty",
    "https://www.youtube.com/@AnoseBeauty"
  ]
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/assets/css/swiper-bundle.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/dist/output-scss.css" />
        <link rel="stylesheet" href="/dist/output-tailwind.css" />
      </head>
      <body
        className={`${poppins.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ConditionalWrapper>
                {children}
              </ConditionalWrapper>
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
              />
              <AdminAutoLogout />
              <PageViewTracker />
              <Script src="/assets/js/phosphor-icons.js" strategy="beforeInteractive" />
              <SpeedInsights />
              <Analytics />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}