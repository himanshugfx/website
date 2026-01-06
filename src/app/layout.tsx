import type { Metadata } from "next";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Geist, Geist_Mono } from "next/font/google";
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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Anose - Premium Cosmetics",
  description: "High-quality Cosmtic Manufactrer and hotel amenities supplier.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/images/fav.png" type="image/png" />
        <link rel="stylesheet" href="/assets/css/swiper-bundle.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/dist/output-scss.css" />
        <link rel="stylesheet" href="/dist/output-tailwind.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ConditionalWrapper>
                {children}
              </ConditionalWrapper>
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
