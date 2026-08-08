import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/admin-login', '/api/', '/profile/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://zozo.pk'}/sitemap.xml`,
  };
}
