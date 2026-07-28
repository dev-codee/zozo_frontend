import Link from "next/link";
import { getPages } from "@/app/lib/api";

export default async function Footer() {
  const pages = await getPages();
  const footerPages = pages.filter((p: any) => 
    p.status === 'PUBLISHED' && 
    (p.placement === 'FOOTER' || p.placement === 'BOTH')
  );

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-border-subtle py-8 px-4 md:px-6">
      <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-on-surface tracking-tight">
              zozo<span className="text-primary-container">.pk</span>
            </span>
          </Link>
        </div>

        {/* Links */}
        <nav className="flex flex-wrap justify-center gap-6">
          {footerPages.map((page: any) => (
            <Link
              key={page._id}
              href={`/pages/${page.slug}`}
              className="text-text-muted hover:text-primary transition-colors text-xs font-medium uppercase tracking-wider"
            >
              {page.title}
            </Link>
          ))}
        </nav>

        {/* Copyright */}
        <div className="text-text-muted text-sm">
          © {new Date().getFullYear()} zozo.pk. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
