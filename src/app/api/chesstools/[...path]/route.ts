import { NextRequest } from 'next/server';

const CHESSTOOLS_BASE = 'https://api.chesstools.org';

// Transparent proxy: forwards the request path exactly as received,
// preserving trailing slashes. The SDK controls the exact path per endpoint.
async function proxy(request: NextRequest) {
  const originalPath = request.nextUrl.pathname.replace('/api/chesstools', '');
  const search = request.nextUrl.search;
  const target = `${CHESSTOOLS_BASE}${originalPath}${search}`;

  const response = await fetch(target);
  const data = await response.text();

  return new Response(data, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  });
}

export const GET = proxy;