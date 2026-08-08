import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-text-muted font-body-sm text-body-sm overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
      <ol className="flex items-center gap-2">
        <li className="inline-flex items-center">
          <Link href="/" className="hover:text-primary transition-colors flex-shrink-0 py-1.5 px-1 inline-flex items-center min-h-[44px]">
            Home
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center gap-2 flex-shrink-0">
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              chevron_right
            </span>
            {item.href ? (
              <Link href={item.href} className="hover:text-primary transition-colors capitalize py-1.5 px-1 inline-flex items-center min-h-[44px]">
                {item.label}
              </Link>
            ) : (
              <span className="text-text-main font-medium truncate max-w-[200px] md:max-w-none capitalize inline-flex items-center min-h-[44px]" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
