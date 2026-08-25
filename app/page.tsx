import type { Metadata } from "next";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FlagshipSection from "./components/FlagshipSection";
import TrendingSection from "./components/TrendingSection";
import BrandsSection from "./components/BrandsSection";
import MobileFinderSection from "./components/MobileFinderSection";
import FeaturedComparisons from "./components/FeaturedComparisons";
import Footer from "./components/Footer";
import { getHomeData, getPopularComparisons } from "./lib/api";
import AdSlot from "./components/AdSlot";

export const revalidate = 300; // Cache and revalidate page every 5 minutes

export const metadata: Metadata = {
  title: "zozo.pk — Compare Mobile Phone Prices in Pakistan",
  description: "Compare latest mobile phone prices in Pakistan across all top retailers. Find the best deals on Samsung, Apple, Xiaomi, Vivo, and more.",
  alternates: {
    canonical: "https://zozo.pk",
  },
  openGraph: {
    title: "zozo.pk — Compare Mobile Phone Prices in Pakistan",
    description: "Compare latest mobile phone prices in Pakistan across all top retailers.",
    url: "https://zozo.pk",
  },
};

export default async function Home() {
  // Fetch home data from backend (server component)
  const [homeData, popularComparisons] = await Promise.all([
    getHomeData(),
    getPopularComparisons(12),
  ]);

  return (
    <>
      <Navbar />
      
      <main className="w-full flex-1">
        <HeroSection />
        
        <div className="w-full overflow-hidden mt-6">
          <FlagshipSection phones={homeData?.trending} />

          <div className="max-w-4xl mx-auto px-4 mt-6">
            <AdSlot placement="TOP_HEADER" layout="row" showSkeleton={false} />
          </div>

          <TrendingSection phones={homeData?.trending} />

          <div className="max-w-4xl mx-auto px-4 mt-12 mb-6">
            <AdSlot placement="BOTTOM_PAGE" layout="row" showSkeleton={false} />
          </div>
        </div>

        {/* Find a Mobile */}
        <MobileFinderSection />

        {/* Featured Brands */}
        <BrandsSection brands={homeData?.brands} />

        {/* Featured Comparisons */}
        <FeaturedComparisons comparisons={popularComparisons} />
      </main>

      <Footer />
    </>
  );
}
