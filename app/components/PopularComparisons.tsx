import Link from "next/link";
import Image from "next/image";

interface PopularComparisonsProps {
  comparisons: any[];
}

export default function PopularComparisons({ comparisons }: PopularComparisonsProps) {
  if (!comparisons || comparisons.length === 0) {
    return null;
  }

  return (
    <section className="w-full">
      <h2 className="font-headline-md text-2xl font-bold text-text-main mb-6">
        Popular Comparisons
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {comparisons.map((comp, index) => {
          if (!comp.phones || comp.phones.length < 2) return null;
          
          const phone1 = comp.phones[0];
          const phone2 = comp.phones[1];
          
          const p1Image = phone1.images?.find((img: any) => img.is_primary)?.url || phone1.images?.[0]?.url || "/placeholder-phone.svg";
          const p2Image = phone2.images?.find((img: any) => img.is_primary)?.url || phone2.images?.[0]?.url || "/placeholder-phone.svg";

          return (
            <Link 
              key={index} 
              href={`/compare/${phone1.slug}/vs/${phone2.slug}`}
              className="bg-surface-white border border-border-subtle rounded-xl p-4 flex items-center justify-between hover:shadow-md hover:border-primary/50 transition-all group"
            >
              <div className="flex flex-col items-center gap-2 w-2/5">
                <div className="w-16 h-16 relative">
                  <Image src={p1Image} alt={phone1.name} fill className="object-contain" sizes="64px" />
                </div>
                <span className="font-label-sm text-xs text-center font-medium line-clamp-2 text-text-main group-hover:text-primary transition-colors">
                  {phone1.name}
                </span>
              </div>
              
              <div className="flex flex-col items-center justify-center w-1/5">
                <div className="w-8 h-8 rounded-full bg-surface-container-low text-text-muted flex items-center justify-center font-bold text-xs italic">
                  VS
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-2 w-2/5">
                <div className="w-16 h-16 relative">
                  <Image src={p2Image} alt={phone2.name} fill className="object-contain" sizes="64px" />
                </div>
                <span className="font-label-sm text-xs text-center font-medium line-clamp-2 text-text-main group-hover:text-primary transition-colors">
                  {phone2.name}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
