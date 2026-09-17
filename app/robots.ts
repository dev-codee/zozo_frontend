import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zozo.pk';

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/phones',
        '/phones?max_price=*',
        '/earbuds',
        '/vehicles',
      ],
      disallow: [
        '/admin/',
        '/admin-login',
        '/api/',
        '/profile/',
        '/search',
        '/*?*brand=*',
        '/*?brand=*',
        '/*?*sort=*',
        '/*?sort=*',
        '/*?*page=*',
        '/*?page=*',
        '/*?*q=*',
        '/*?q=*',
        '/*?*color=*',
        '/*?*ram=*',
        '/*?*storage=*',
        '/*?*wearing_type=*',
        '/*?*has_anc=*',
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
