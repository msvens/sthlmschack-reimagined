import { NextRequest } from 'next/server';

const SSF_API_BASE = process.env.SSF_API_URL || 'https://member.schack.se/public/api/v1';

// Transparent proxy: forwards the request path exactly as received,
// preserving trailing slashes. The SDK controls the exact path per endpoint.
async function proxy(request: NextRequest) {
  const originalPath = request.nextUrl.pathname.replace('/api/chess/v1', '');
  const search = request.nextUrl.search;
  const target = `${SSF_API_BASE}${originalPath}${search}`;

  const response = await fetch(target, {
    method: request.method,
    headers: { 'Content-Type': 'application/json' },
    body: request.method !== 'GET' ? await request.text() : undefined,
  });

  const data = await response.text();
  return new Response(data, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  });
}

export const GET = proxy;
export const POST = proxy;