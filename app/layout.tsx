import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zozo.pk'),
  title: "zozo.pk — Compare Mobile Phone Prices in Pakistan",
  description: "Compare latest mobile phone prices in Pakistan across all top retailers. Find the best deals on Samsung, Apple, Xiaomi, Vivo, and more.",
  keywords: "mobile phones, prices, Pakistan, compare, Samsung, Apple, Xiaomi, Vivo, Oppo, Infinix, Tecno",
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://zozo.pk",
    title: "zozo.pk — Compare Mobile Phone Prices in Pakistan",
    description: "Compare latest mobile phone prices in Pakistan across all top retailers. Find the best deals on Samsung, Apple, Xiaomi, Vivo, and more.",
    siteName: "zozo.pk",
  },
  twitter: {
    card: "summary_large_image",
    title: "zozo.pk — Compare Mobile Phone Prices in Pakistan",
    description: "Compare latest mobile phone prices in Pakistan across all top retailers.",
  },
};

import { AuthProvider } from './context/AuthContext';
import ActivityTracker from './components/ActivityTracker';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        {/* Font loading is handled locally via imports now, eliminating render-blocking CDN requests */}
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <ActivityTracker />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
