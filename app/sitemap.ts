import { MetadataRoute } from 'next';
import { getPhones, getPages } from './lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://zozo.pk';

  // Base static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/phones`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }
  ];

  try {
    // Dynamic Phone routes
    const phonesData = await getPhones('limit=1000'); // Fetch up to 1000 phones for sitemap
    if (phonesData && phonesData.phones) {
      const phoneRoutes: MetadataRoute.Sitemap = phonesData.phones.map((phone) => ({
        url: `${baseUrl}/${phone.slug}-price-in-pakistan`,
        lastModified: phone.updated_at ? new Date(phone.updated_at) : new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }));
      routes.push(...phoneRoutes);
    }

    // Dynamic Pages routes (e.g. Best for Students, About Us)
    const pagesData = await getPages();
    if (pagesData && Array.isArray(pagesData)) {
      const activePages = pagesData.filter(p => p.status === 'PUBLISHED');
      const pageRoutes: MetadataRoute.Sitemap = activePages.map((page) => ({
        url: `${baseUrl}/pages/${page.slug}`,
        lastModified: page.updatedAt ? new Date(page.updatedAt) : new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      }));
      routes.push(...pageRoutes);
    }
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  return routes;
}
