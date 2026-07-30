// ─── JSON-LD Structured Data Generators ─────────────────────────────────────
// These helper functions generate Google-compliant JSON-LD structured data
// for better SEO and rich snippets in search results.

interface SchemaPhone {
  name: string;
  slug: string;
  brand_slug: string;
  description?: string;
  images?: { url: string; alt_text?: string }[];
  model_number?: string;
  release_date?: string;
  price_pkr?: number;
  prices?: { retailer_name: string; price_pkr: number; product_url?: string; stock_status?: string }[];
  rating?: { average?: number; count?: number };
  seo?: {
    meta_title?: string;
    meta_description?: string;
    ai_faq?: { question: string; answer: string }[];
  };
  video_url?: string;
  specs?: any;
}

interface SchemaReview {
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zozo.pk';

// ─── Product Schema ──────────────────────────────────────────────────────────

export function generateProductSchema(phone: SchemaPhone) {
  const primaryImage = phone.images?.find(img => img.url)?.url;
  const lowestPrice = phone.price_pkr || (phone.prices?.length ? Math.min(...phone.prices.map(p => p.price_pkr)) : null);

  const offers = phone.prices?.filter(p => p.product_url).map(p => ({
    "@type": "Offer",
    "url": p.product_url,
    "priceCurrency": "PKR",
    "price": p.price_pkr,
    "availability": p.stock_status?.toLowerCase().includes('out') 
      ? "https://schema.org/OutOfStock" 
      : "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": p.retailer_name
    }
  })) || [];

  const schema: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": phone.name,
    "description": phone.seo?.meta_description || phone.description || `${phone.name} Price in Pakistan, Specifications and Reviews`,
    "brand": {
      "@type": "Brand",
      "name": phone.brand_slug.toUpperCase().replace('-', ' ')
    },
    "url": `${SITE_URL}/phones/${phone.slug}`,
    "category": "Mobile Phone",
  };

  if (primaryImage) {
    schema.image = primaryImage;
  }

  if (phone.model_number) {
    schema.sku = phone.model_number;
    schema.mpn = phone.model_number;
  }

  if (phone.release_date) {
    schema.releaseDate = phone.release_date;
  }

  if (phone.rating?.average && phone.rating?.count) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": phone.rating.average.toFixed(1),
      "bestRating": "5",
      "worstRating": "1",
      "ratingCount": phone.rating.count
    };
  }

  if (offers.length > 0) {
    schema.offers = offers.length === 1 ? offers[0] : {
      "@type": "AggregateOffer",
      "lowPrice": Math.min(...phone.prices!.map(p => p.price_pkr)),
      "highPrice": Math.max(...phone.prices!.map(p => p.price_pkr)),
      "priceCurrency": "PKR",
      "offerCount": offers.length,
      "offers": offers
    };
  } else if (lowestPrice) {
    schema.offers = {
      "@type": "Offer",
      "priceCurrency": "PKR",
      "price": lowestPrice,
      "availability": "https://schema.org/InStock",
      "url": `${SITE_URL}/phones/${phone.slug}`
    };
  }

  return schema;
}

// ─── Review Schema ───────────────────────────────────────────────────────────

export function generateReviewSchema(reviews: SchemaReview[], phoneName: string) {
  if (!reviews || reviews.length === 0) return null;

  return reviews.slice(0, 5).map(review => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Product",
      "name": phoneName
    },
    "author": {
      "@type": "Person",
      "name": review.userName
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": review.rating,
      "bestRating": "5"
    },
    "reviewBody": review.comment,
    "datePublished": review.createdAt
  }));
}

// ─── FAQ Schema ──────────────────────────────────────────────────────────────

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs || faqs.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

// ─── Breadcrumb Schema ───────────────────────────────────────────────────────

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  const allItems = [{ label: "Home", href: "/" }, ...items];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      ...(item.href ? { "item": `${SITE_URL}${item.href}` } : {})
    }))
  };
}

// ─── Video Schema ────────────────────────────────────────────────────────────

export function generateVideoSchema(phone: SchemaPhone) {
  if (!phone.video_url) return null;

  // Extract YouTube video ID
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = phone.video_url.match(regExp);
  const videoId = match && match[2].length === 11 ? match[2] : null;

  if (!videoId) return null;

  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": `${phone.name} Review & Hands-on`,
    "description": `Watch the video review and hands-on of ${phone.name}`,
    "thumbnailUrl": `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    "uploadDate": phone.release_date || new Date().toISOString(),
    "contentUrl": phone.video_url,
    "embedUrl": `https://www.youtube.com/embed/${videoId}`
  };
}

// ─── Organization Schema ─────────────────────────────────────────────────────

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "ZOZO.pk",
    "url": SITE_URL,
    "logo": `${SITE_URL}/ZOZO-Logo.png`,
    "description": "Compare latest mobile phone prices in Pakistan across all top retailers.",
    "sameAs": []
  };
}

// ─── WebSite Schema with SearchAction ────────────────────────────────────────

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "ZOZO.pk",
    "url": SITE_URL,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SITE_URL}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

// ─── WebPage Schema ──────────────────────────────────────────────────────────

export function generateWebPageSchema(title: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": title,
    "description": description,
    "url": `${SITE_URL}${url}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "ZOZO.pk",
      "url": SITE_URL
    }
  };
}

// ─── CollectionPage Schema ───────────────────────────────────────────────────

export function generateCollectionPageSchema(title: string, description: string, url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": `${SITE_URL}${url}`
  };
}
