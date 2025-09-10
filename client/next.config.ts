import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      rules: {
        // Turbopack config if needed
      },
    },
  },
  images: {
    domains: ["rjjfljyittpttuymwwni.supabase.co"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/admin",
        destination: "/admin/login",
        permanent: false,
      },
    ];
  },
  // Remove build error ignoring for production
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
