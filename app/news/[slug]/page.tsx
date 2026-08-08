import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getApiBaseUrl } from '@/app/lib/api';

async function getBlog(slug: string) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/blogs/slug/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch blog', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await getBlog(resolvedParams.slug);
  if (!blog) return { title: 'Not Found | Zozo' };
  
  const canonicalUrl = `https://zozo.pk/news/${resolvedParams.slug}`;
  const title = `${blog.title} — Mobile News & Reviews`;
  const description = blog.excerpt || blog.title;
  const image = blog.coverImage || '/ZOZO-Logo-v2.png';

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: blog.createdAt,
      modifiedTime: blog.updatedAt || blog.createdAt,
      images: [{ url: image, alt: blog.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default async function SingleBlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const blog = await getBlog(resolvedParams.slug);

  if (!blog || blog.status !== 'PUBLISHED') {
    notFound();
  }

  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": blog.title,
    "description": blog.excerpt || blog.title,
    "image": blog.coverImage ? [blog.coverImage] : [],
    "datePublished": blog.createdAt,
    "dateModified": blog.updatedAt || blog.createdAt,
    "author": {
      "@type": "Organization",
      "name": "ZOZO.pk",
      "url": "https://zozo.pk"
    },
    "publisher": {
      "@type": "Organization",
      "name": "ZOZO.pk",
      "logo": {
        "@type": "ImageObject",
        "url": "https://zozo.pk/ZOZO-Logo-v2.png"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleSchema) }}
      />
      <div className="max-w-[800px] mx-auto px-4 md:px-6 py-12">
      <div className="mb-8">
        <Link href="/news" className="text-primary hover:underline text-sm font-medium mb-6 inline-block">
          ← Back to News
        </Link>
        <div className="flex gap-2 mb-4">
          {blog.categories.map((c: any) => (
            <span key={c._id} className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
              {c.name}
            </span>
          ))}
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-on-surface leading-tight mb-4">{blog.title}</h1>
        {blog.excerpt && (
          <p className="text-xl text-text-muted mb-6">{blog.excerpt}</p>
        )}
        <div className="flex items-center text-sm text-text-muted border-t border-b border-border-subtle py-3">
          <span>Published on {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div 
        className="prose prose-lg max-w-none text-on-surface prose-headings:text-on-surface prose-a:text-primary hover:prose-a:text-primary-hover"
        dangerouslySetInnerHTML={{ __html: blog.body }}
      />
    </div>
  </>
  );
}
