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
        <link rel="stylesheet" href="/assets/css/swiper-bundle.min.css" />
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="stylesheet" href="/dist/output-scss.css" />
        <link rel="stylesheet" href="/dist/output-tailwind.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ConditionalWrapper>
                <Header />
                <Marquee />
                {children}
                <CartPopup />
                <Footer />
              </ConditionalWrapper>
              <Script src="/assets/js/phosphor-icons.js" strategy="beforeInteractive" />
              <SpeedInsights />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
