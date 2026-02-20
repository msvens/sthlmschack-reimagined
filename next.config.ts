import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  skipTrailingSlashRedirect: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'resultat.schack.se',
        pathname: '/getPlayerPhoto*'
      }
    ]
  },
  // API proxies are handled by route handlers (not rewrites) to preserve
  // trailing slashes. The SSF API is inconsistent: GET endpoints break WITH
  // trailing slashes, POST endpoints break WITHOUT them.
  //   SSF API:       src/app/api/chess/v1/[...path]/route.ts
  //   ChessTools API: src/app/api/chesstools/[...path]/route.ts
};

export default nextConfig;
