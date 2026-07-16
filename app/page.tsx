import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import TrendingSection from "./components/TrendingSection";
import CompareWidget from "./components/CompareWidget";
import Footer from "./components/Footer";
import { getHomeData } from "./lib/api";

export default async function Home() {
  // Fetch home data from backend (server component)
  const homeData = await getHomeData();

  return (
    <>
      <Navbar />
      <main className="w-full flex-1">
        <HeroSection />
        <TrendingSection phones={homeData?.trending} />
        <CompareWidget />
      </main>
      <Footer />
    </>
  );
}
