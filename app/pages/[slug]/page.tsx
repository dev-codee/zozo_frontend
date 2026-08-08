import { notFound } from 'next/navigation';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import StaticSidebar from '@/app/components/StaticSidebar';
import { getApiBaseUrl } from '@/app/lib/api';

async function getPage(slug: string) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/pages/slug/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch page', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const page = await getPage(resolvedParams.slug);
  if (!page) return { title: 'Not Found' };
  
  return {
    title: `${page.title} - zozo.pk`,
  };
}

export default async function StaticPagePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const page = await getPage(resolvedParams.slug);

  if (!page || page.status !== 'PUBLISHED') {
    notFound();
  }

  return (
    <>
      <Navbar />
      <div className="w-full flex flex-col md:flex-row bg-surface">
        <StaticSidebar activeSlug={page.slug} />
        
        <main className="flex-1 bg-surface-white p-8 md:p-12 min-h-[calc(100vh-64px)]">
          <div className="mb-8 max-w-4xl border-b border-border-subtle pb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface leading-tight mb-4">{page.title}</h1>
      </div>

      <div 
        className="prose prose-sm md:prose-base max-w-4xl text-on-surface prose-headings:text-on-surface prose-a:text-primary hover:prose-a:text-primary-hover"
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
      </main>
      </div>
      <Footer />
    </>
  );
}
