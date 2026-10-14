import { isIndexableArticle } from "@/app/lib/editorial";
import { serializeJsonLd } from "@/app/lib/schema";
import { rebrandSiteContent } from "@/app/lib/branding";
import { cleanMetadata, withoutSiteBrand } from "@/app/lib/seo";
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getApiBaseUrl } from '@/app/lib/api';

async function getBlog(slug: string) {
  try {
    const res = await fetch(`${getApiBaseUrl()}/blogs/slug/${slug}`, {
      next: { revalidate: 60 }
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`news fetch failed: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch blog', error);
    throw error;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const blog = await getBlog(resolvedParams.slug);
  if (!blog || blog.status !== "PUBLISHED") return cleanMetadata({ title: 'Not Found', robots: { index: false, follow: false } });
  
  const canonicalUrl = `https://mobilerates.info/news/${resolvedParams.slug}`;
  const title = blog.seo?.meta_title || `${blog.title} — Mobile News & Reviews`;
  const description = blog.seo?.meta_description || blog.excerpt || blog.title;
  const image = blog.coverImage || '/social-preview.png';

  return cleanMetadata({
    title,
    description,
    robots: { index: isIndexableArticle(blog), follow: true },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      publishedTime: blog.publish_date || blog.createdAt,
      modifiedTime: blog.updatedAt || blog.createdAt,
      images: [{ url: image, alt: blog.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  });
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
    "headline": withoutSiteBrand(blog.title),
    "description": withoutSiteBrand(blog.excerpt || blog.title),
    "image": blog.coverImage ? [blog.coverImage] : [],
    "datePublished": blog.publish_date || blog.createdAt,
    "dateModified": blog.updatedAt || blog.createdAt,
    ...(blog.author ? { author: { "@type": "Person", name: withoutSiteBrand(blog.author) } } : {}),
    "publisher": {
      "@type": "Organization",
      "name": "Mobile price comparison website",
      "url": "https://mobilerates.info"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(newsArticleSchema) }}
      />
      <div className="max-w-[800px] mx-auto px-4 md:px-6 py-12">
      <div className="mb-8">
        <Link href="/news" className="text-primary hover:underline text-sm font-medium mb-6 inline-block">
          ← Back to News
        </Link>
        <div className="flex gap-2 mb-4">
          {(blog.categories ?? []).map((c: any) => (
            <span key={c._id} className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-1 rounded">
              {c.name}
            </span>
          ))}
        </div>
        <h1 className="text-3xl md:text-5xl font-bold text-on-surface leading-tight mb-4">{rebrandSiteContent(blog.title)}</h1>
        {blog.excerpt && (
          <p className="text-xl text-text-muted mb-6">{rebrandSiteContent(blog.excerpt)}</p>
        )}
        <div className="flex items-center text-sm text-text-muted border-t border-b border-border-subtle py-3">
          <span>Published on {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div 
        className="prose prose-lg max-w-none text-on-surface prose-headings:text-on-surface prose-a:text-primary hover:prose-a:text-primary-hover"
        dangerouslySetInnerHTML={{ __html: rebrandSiteContent(blog.body) }}
      />
    </div>
  </>
  );
}
