import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

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
import { IBM_Plex_Sans } from "next/font/google";
import AnoseAssistant from "@/components/AnoseAssistant";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://anosebeauty.com"),
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
    url: "https://anosebeauty.com",
    siteName: "Anose",
    images: [
      {
        url: "/assets/images/banner/khushi-banner.webp",
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
    images: ["/assets/images/banner/khushi-banner.webp"],
  },
  icons: {
    icon: "/assets/images/fav.png",
    shortcut: "/assets/images/fav.png",
    apple: "/assets/images/fav.png",
  },
  manifest: "/manifest.json",
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Anose Beauty",
    "alternateName": "Anose",
    "url": "https://anosebeauty.com",
    "logo": "https://anosebeauty.com/assets/images/fav.png",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "+91-9110134408",
        "contactType": "customer service",
        "email": "wecare@anosebeauty.com",
        "availableLanguage": ["en", "Hindi"],
        "areaServed": "IN"
      }
    ],
    "sameAs": [
      "https://www.facebook.com/AnoseBeauty",
      "https://www.instagram.com/anosebeauty",
      "https://www.youtube.com/@AnoseBeauty",
      "https://www.linkedin.com/company/anosebeauty"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Anose Beauty Private Limited",
    "image": "https://anosebeauty.com/assets/images/banner/khushi-banner.webp",
    "@id": "https://anosebeauty.com",
    "url": "https://anosebeauty.com",
    "telephone": "+919110134408",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "B-103, B Block, Sector 6",
      "addressLocality": "Noida",
      "addressRegion": "UP",
      "postalCode": "201301",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 28.592879,
      "longitude": 77.314281
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "10:30",
      "closes": "18:30"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://anosebeauty.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://anosebeauty.com/shop?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  }
];


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/htn0bil.css" />
      </head>
      <body
        className={`${ibmPlexSans.variable} font-sans antialiased`}
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
              <Script src="/assets/js/phosphor-icons.js" strategy="afterInteractive" />
              {/* Google Analytics */}
              <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-E2J25CTNXK"
                strategy="afterInteractive"
              />
              <Script id="google-analytics" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', 'G-E2J25CTNXK');
                `}
              </Script>
              <SpeedInsights />
              <Analytics />
              <AnoseAssistant />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}