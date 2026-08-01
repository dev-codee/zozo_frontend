import Link from "next/link";
import Image from "next/image";
import { getPages } from "@/app/lib/api";

export default async function Footer() {
  const pages = await getPages();
  const footerPages = pages.filter((p: any) => 
    p.status === 'PUBLISHED' && 
    (p.placement === 'FOOTER' || p.placement === 'BOTH')
  );

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-border-subtle py-12 px-4 md:px-6 mt-auto">
      <div className="max-w-[1280px] mx-auto flex flex-col items-center justify-center gap-6 text-center">
        {/* Brand */}
        <Link href="/" className="inline-block hover:opacity-90 transition-opacity">
          <Image src="/ZOZO-Logo.png" alt="zozo.pk" width={160} height={45} className="h-12 w-auto object-contain" />
        </Link>

        {/* Links */}
        <nav className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3">
          {footerPages.length > 0 ? (
            footerPages.map((page: any) => (
              <Link
                key={page._id}
                href={`/pages/${page.slug}`}
                className="text-text-main hover:text-primary transition-colors text-sm font-semibold"
              >
                {page.title}
              </Link>
            ))
          ) : (
            <>
              <Link href="/pages/about" className="text-text-main hover:text-primary transition-colors text-sm font-semibold">About</Link>
              <Link href="/pages/privacy" className="text-text-main hover:text-primary transition-colors text-sm font-semibold">Privacy</Link>
              <Link href="/pages/contact" className="text-text-main hover:text-primary transition-colors text-sm font-semibold">Contact</Link>
              <Link href="/pages/terms" className="text-text-main hover:text-primary transition-colors text-sm font-semibold">Terms and Conditions</Link>
            </>
          )}
        </nav>

        {/* Copyright */}
        <div className="text-text-muted text-xs mt-2">
          © {new Date().getFullYear()} zozo.pk. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
