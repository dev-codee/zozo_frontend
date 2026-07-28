import Link from 'next/link';
import { getPages } from '@/app/lib/api';

export default async function StaticSidebar({ activeSlug }: { activeSlug?: string }) {
  const pages = await getPages();
  const publishedPages = pages.filter((p: any) => p.status === 'PUBLISHED');

  return (
    <aside className="w-full md:w-72 flex-shrink-0 border-r border-border-subtle bg-surface-white md:min-h-[calc(100vh-64px)]">
      <div className="p-6 sticky top-0 md:top-24">
        <h3 className="font-headline-sm text-lg font-bold text-text-main mb-4 uppercase tracking-wider">
          Information
        </h3>
        <nav className="space-y-2 flex flex-col">
          <Link
            href="/news"
            className={`px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
              activeSlug === 'news'
                ? 'bg-primary/10 text-primary'
                : 'text-text-muted hover:bg-surface-container-low hover:text-text-main'
            }`}
          >
            News & Reviews
          </Link>
          
          {publishedPages.map((page: any) => (
            <Link
              key={page.slug}
              href={`/pages/${page.slug}`}
              className={`px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${
                activeSlug === page.slug
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-muted hover:bg-surface-container-low hover:text-text-main'
              }`}
            >
              {page.title}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
