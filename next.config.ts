import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizeCss: true,
  },
  images: {
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
    ];
  },
  async redirects() {
    return [
      {
        source: "/phones/:slug",
        destination: "/:slug-price-price-in-pakistan",
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
