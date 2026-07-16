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
    <nav className="flex items-center gap-2 text-text-muted font-body-sm text-body-sm overflow-x-auto whitespace-nowrap scrollbar-hide pb-2 md:pb-0">
      <Link href="/" className="hover:text-primary transition-colors flex-shrink-0">
        Home
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2 flex-shrink-0">
          <span className="material-symbols-outlined text-[16px]">
            chevron_right
          </span>
          {item.href ? (
            <Link href={item.href} className="hover:text-primary transition-colors capitalize">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-main font-medium truncate max-w-[200px] md:max-w-none capitalize">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
