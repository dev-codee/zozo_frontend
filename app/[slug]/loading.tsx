import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-8 flex flex-col gap-[15px] bg-surface animate-pulse">
        {/* Breadcrumb Skeleton */}
        <div className="h-5 bg-surface-container-low rounded w-1/4 mb-2"></div>

        {/* Hero Section Container */}
        <div className="bg-white border border-border-subtle rounded-xl p-6 md:p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Gallery Skeleton */}
            <div className="flex flex-col gap-4">
              <div className="w-full aspect-square bg-surface-container-lowest border border-border-subtle rounded-xl"></div>
              <div className="flex gap-2">
                <div className="w-16 h-16 bg-surface-container-lowest border border-border-subtle rounded-lg"></div>
                <div className="w-16 h-16 bg-surface-container-lowest border border-border-subtle rounded-lg"></div>
                <div className="w-16 h-16 bg-surface-container-lowest border border-border-subtle rounded-lg"></div>
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div className="flex flex-col gap-4">
              <div className="h-10 bg-surface-container-low rounded w-3/4 mb-2"></div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 bg-surface-container-low rounded w-20"></div>
                <div className="h-6 bg-surface-container-low rounded w-16"></div>
                <div className="h-6 bg-surface-container-low rounded w-16"></div>
              </div>
              
              <div className="h-12 bg-surface-container-low rounded w-1/2 mb-6"></div>

              {/* Specs Grid Skeleton */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex gap-2 items-center border border-border-subtle rounded-lg p-2">
                    <div className="w-8 h-8 rounded-full bg-surface-container-low"></div>
                    <div className="flex flex-col gap-1 w-full">
                      <div className="h-3 bg-surface-container-low rounded w-1/2"></div>
                      <div className="h-4 bg-surface-container-low rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Buttons Skeleton */}
              <div className="flex gap-3 mt-4">
                <div className="h-12 bg-surface-container-low rounded-xl flex-1"></div>
                <div className="h-12 bg-surface-container-low rounded-xl w-12"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Description/Reviews/Prices Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-white border border-border-subtle rounded-xl p-6 h-64"></div>
            <div className="bg-white border border-border-subtle rounded-xl p-6 h-96"></div>
          </div>
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white border border-border-subtle rounded-xl p-6 h-80"></div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
