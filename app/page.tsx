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
import { generateOrganizationSchema, generateWebSiteSchema } from "./lib/schema";

export default async function Home() {
  // Fetch home data from backend (server component)
  const [homeData, popularComparisons] = await Promise.all([
    getHomeData(),
    getPopularComparisons(12),
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebSiteSchema()) }} />
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
