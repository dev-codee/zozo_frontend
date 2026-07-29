import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/api/', '/login', '/admin-login'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zozo.pk'}/sitemap.xml`,
  };
}
