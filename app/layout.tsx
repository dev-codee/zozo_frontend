import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

import { generateOrganizationSchema, generateWebSiteSchema } from "./lib/schema";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://zozo.pk'),
  title: {
    default: "zozo.pk — Compare Mobile Phone Prices in Pakistan",
    template: "%s | Zozo",
  },
  description: "Compare latest mobile phone prices in Pakistan across all top retailers. Find the best deals on Samsung, Apple, Xiaomi, Vivo, and more.",
  keywords: "mobile phones, prices, Pakistan, compare, Samsung, Apple, Xiaomi, Vivo, Oppo, Infinix, Tecno",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://zozo.pk",
    title: "zozo.pk — Compare Mobile Phone Prices in Pakistan",
    description: "Compare latest mobile phone prices in Pakistan across all top retailers. Find the best deals on Samsung, Apple, Xiaomi, Vivo, and more.",
    siteName: "zozo.pk",
    images: [
      {
        url: "/ZOZO-Logo-v2.png",
        width: 1200,
        height: 630,
        alt: "zozo.pk Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "zozo.pk — Compare Mobile Phone Prices in Pakistan",
    description: "Compare latest mobile phone prices in Pakistan across all top retailers.",
    images: ["/ZOZO-Logo-v2.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebSiteSchema()) }}
        />
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
