import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "zozo.pk — Compare Mobile Phone Prices in Pakistan",
  description:
    "Compare latest mobile phone prices in Pakistan across all top retailers. Find the best deals on Samsung, Apple, Xiaomi, Vivo, and more.",
  keywords: "mobile phones, prices, Pakistan, compare, Samsung, Apple, Xiaomi",
  robots: {
    index: false,
    follow: false,
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
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block"
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
