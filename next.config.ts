import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'resultat.schack.se',
        pathname: '/getPlayerPhoto*'
      }
    ]
  },
  async rewrites() {
    return [
      // Production API rewrite (used by default via SSF_PROXY_URL)
      {
        source: '/api/chess/v1/:path*',
        destination: 'https://member.schack.se/public/api/v1/:path*'
      },
      // Development API rewrite (halvarsson test server, use via SSF_DEV_PROXY_URL)
      {
        source: '/api/chess-dev/v1/:path*',
        destination: 'https://halvarsson.no-ip.com/webapp/memdb/public/api/v1/:path*'
      }
    ]
  }
};

export default nextConfig;
