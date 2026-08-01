import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FlagshipSection from "./components/FlagshipSection";
import TrendingSection from "./components/TrendingSection";
import Footer from "./components/Footer";
import HomeSidebar from "./components/HomeSidebar";
import { getHomeData } from "./lib/api";
import AdSlot from "./components/AdSlot";
import { generateOrganizationSchema, generateWebSiteSchema } from "./lib/schema";

export default async function Home() {
  // Fetch home data from backend (server component)
  const homeData = await getHomeData();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateOrganizationSchema()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(generateWebSiteSchema()) }} />
      <Navbar />
      
      <main className="w-full flex-1">
        <HeroSection />
        
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row mt-6">
          {/* Left Sidebar */}
          <HomeSidebar />
          
          {/* Right Main Content */}
          <div className="flex-1 w-full overflow-hidden">
            <FlagshipSection phones={homeData?.trending} />
            
            <div className="max-w-4xl mx-auto px-4 mt-6">
              <AdSlot placement="TOP_HEADER" layout="row" />
            </div>
            
            <TrendingSection phones={homeData?.trending} />
            
            <div className="max-w-4xl mx-auto px-4 mt-12 mb-6">
              <AdSlot placement="BOTTOM_PAGE" layout="row" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
