import Link from "next/link";
import { getBrands } from "@/app/lib/api";

export default async function HomeSidebar() {
  const brands = await getBrands();
  // We'll show top 5-6 brands
  const topBrands = brands.slice(0, 6);
  // Fallback if API fails
  const displayBrands = topBrands.length > 0 ? topBrands : [
    { name: "Vivo", slug: "vivo" },
    { name: "Oppo", slug: "oppo" },
    { name: "Tecno", slug: "tecno" },
    { name: "Samsung", slug: "samsung" },
    { name: "Xiaomi", slug: "xiaomi" }
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 lg:border-r border-border-subtle bg-surface-white min-h-full pb-8">
      <div className="p-5 lg:sticky lg:top-24 space-y-8">
        
        {/* All Brands Section */}
        <div>
          <h3 className="text-sm font-bold text-primary tracking-wider uppercase mb-3">
            List All Brand Mobile
          </h3>
          <ul className="space-y-1">
            {displayBrands.map((brand: any) => (
              <li key={brand.slug}>
                <Link
                  href={`/${brand.slug}-phone-price-pakistan`}
                  className="block px-3 py-2 text-sm font-semibold text-text-main hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  {brand.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/brands" className="block px-3 py-2 text-xs font-bold text-primary hover:underline mt-1">
                View All Brands →
              </Link>
            </li>
          </ul>
        </div>

        <hr className="border-border-subtle/50" />

        {/* Prices Section */}
        <div>
          <h3 className="text-sm font-bold text-primary tracking-wider uppercase mb-3">
            Mobiles Under Price
          </h3>
          <ul className="space-y-1">
            {[
              { label: "Under 15,000", max: 15000 },
              { label: "Under 30,000", max: 30000 },
              { label: "Under 50,000", max: 50000 },
              { label: "Under 80,000", max: 80000 },
              { label: "Under 150,000", max: 150000 }
            ].map((price) => (
              <li key={price.max}>
                <Link
                  href={`/phones?max_price=${price.max}`}
                  className="block px-3 py-2 text-sm font-semibold text-text-main hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                >
                  {price.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <hr className="border-border-subtle/50" />

        {/* Search By Features */}
        <div>
          <h3 className="text-sm font-bold text-primary tracking-wider uppercase mb-3">
            Search By Features
          </h3>
          <div className="space-y-2">
            <Link href="/phones?feature=processor" className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border-subtle hover:border-primary hover:bg-primary/5 transition-colors group">
              <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors text-[20px]">
                developer_board
              </span>
              <span className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                Processor
              </span>
            </Link>
            <Link href="/phones?feature=ram" className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border-subtle hover:border-primary hover:bg-primary/5 transition-colors group">
              <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors text-[20px]">
                memory
              </span>
              <span className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                RAM
              </span>
            </Link>
            <Link href="/phones?feature=camera" className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border-subtle hover:border-primary hover:bg-primary/5 transition-colors group">
              <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors text-[20px]">
                photo_camera
              </span>
              <span className="text-sm font-semibold text-text-main group-hover:text-primary transition-colors">
                Camera
              </span>
            </Link>
          </div>
        </div>

      </div>
    </aside>
  );
}
