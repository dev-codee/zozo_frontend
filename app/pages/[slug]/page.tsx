import { notFound } from 'next/navigation';

async function getPage(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pages/slug/${slug}`, {
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
    <div className="max-w-[800px] mx-auto px-4 md:px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl md:text-5xl font-bold text-on-surface leading-tight mb-4">{page.title}</h1>
        <div className="w-16 h-1 bg-primary mx-auto rounded"></div>
      </div>

      <div 
        className="prose prose-lg max-w-none text-on-surface prose-headings:text-on-surface prose-a:text-primary hover:prose-a:text-primary-hover"
        dangerouslySetInnerHTML={{ __html: page.body }}
      />
    </div>
  );
}
