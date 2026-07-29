import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import TrendingSection from "./components/TrendingSection";
import CompareWidget from "./components/CompareWidget";
import Footer from "./components/Footer";
import { getHomeData } from "./lib/api";
import AdSlot from "./components/AdSlot";

export default async function Home() {
  // Fetch home data from backend (server component)
  const homeData = await getHomeData();

  return (
    <>
      <Navbar />
      <main className="w-full flex-1">
        <HeroSection />
        <div className="max-w-4xl mx-auto px-4 mt-6">
          <AdSlot placement="TOP_HEADER" layout="row" />
        </div>
        <TrendingSection phones={homeData?.trending} />
        <CompareWidget />
        <div className="max-w-4xl mx-auto px-4 mt-12 mb-6">
          <AdSlot placement="BOTTOM_PAGE" layout="row" />
        </div>
      </main>
      <Footer />
    </>
  );
}
