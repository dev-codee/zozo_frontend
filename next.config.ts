import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    // Inline CSS into <style> in the <head> instead of a render-blocking
    // <link>. Recommended for atomic CSS (Tailwind): styles arrive with the
    // HTML so the browser can paint immediately, cutting LCP render delay.
    inlineCss: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
          },
        ],
      },
      {
        source: "/(brands|fonts|icons)/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/phones/:slug",
        destination: "/:slug-price-in-pakistan",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/:brand-phone-price-pakistan",
        destination: "/phones?brand=:brand",
      },
    ];
  },
};

export default nextConfig;
