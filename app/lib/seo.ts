import type { Metadata } from "next";

// Clean previously saved market-targeted SEO copy as well as new defaults.
export function withoutRegionalTargeting(text: string): string {
  return text
    .replace(/\b(?:(?:in|across|throughout|within|for)\s+)?(?:pakistan|karachi|lahore|islamabad)(?:['’]s)?\b/gi, "")
    .replace(/\bpakistani\s+/gi, "")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/,\s*(?=,|$)/g, "")
    .replace(/\s*([|–—])\s*(?=[|–—]|$)/g, "")
    .replace(/^[\s|–—,:-]+|[\s|–—,:-]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

// The site brand is shown in the UI, never appended to search or share copy.
// Apply this to CMS fields as well as defaults to handle previously saved copy.
export function withoutSiteBrand(text: string): string {
  return withoutRegionalTargeting(text)
    .replace(/\b(?:(?:on|at|by|from|visit)\s+)?(?:zozo(?:\.pk)?|mobile\s*rates(?:\.info)?)(?:['’]s)?\b/gi, "")
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/\s*([|–—])\s*(?=[|–—]|$)/g, "")
    .replace(/^[\s|–—:-]+|[\s|–—:-]+$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanTitle<T>(title: T): T {
  if (typeof title === "string") return withoutSiteBrand(title) as T;
  if (title && typeof title === "object") {
    return Object.fromEntries(
      Object.entries(title).map(([key, value]) => [key, typeof value === "string" ? withoutSiteBrand(value) : value]),
    ) as T;
  }
  return title;
}

export function cleanMetadata(metadata: Metadata): Metadata {
  return {
    ...metadata,
    title: cleanTitle(metadata.title),
    description: metadata.description ? withoutSiteBrand(metadata.description) : metadata.description,
    ...(metadata.keywords && {
      keywords: Array.isArray(metadata.keywords)
        ? metadata.keywords.map(withoutSiteBrand).filter(Boolean)
        : withoutSiteBrand(metadata.keywords),
    }),
    ...(metadata.openGraph && {
      openGraph: {
        ...metadata.openGraph,
        title: cleanTitle(metadata.openGraph.title),
        description: metadata.openGraph.description ? withoutSiteBrand(metadata.openGraph.description) : metadata.openGraph.description,
      },
    }),
    ...(metadata.twitter && {
      twitter: {
        ...metadata.twitter,
        title: cleanTitle(metadata.twitter.title),
        description: metadata.twitter.description ? withoutSiteBrand(metadata.twitter.description) : metadata.twitter.description,
      },
    }),
  };
}
