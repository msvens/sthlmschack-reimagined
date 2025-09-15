import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/chess/v1/:path*',
        destination: 'https://member.schack.se/public/api/v1/:path*'
      }
    ]
  }
};

export default nextConfig;
