import { NextRequest } from 'next/server';

const SSF_API_BASE = process.env.SSF_API_URL || 'https://member.schack.se/public/api/v1';

// Transparent proxy: forwards the request path exactly as received,
// preserving trailing slashes. The SDK controls the exact path per endpoint.
async function proxy(request: NextRequest) {
  try {
    const originalPath = request.nextUrl.pathname.replace('/api/chess/v1', '');
    const search = request.nextUrl.search;
    const target = `${SSF_API_BASE}${originalPath}${search}`;

    const response = await fetch(target, {
      method: request.method,
      headers: { 'Content-Type': 'application/json' },
      body: request.method !== 'GET' ? await request.text() : undefined,
    });

    // 204/304 are null-body statuses — constructing a Response with a body for
    // them throws, so pass null. (The SSF API returns 204 for "no data", e.g. a
    // player with no rating at a given date; without this it became a spurious 502.)
    const nullBody = response.status === 204 || response.status === 304;
    const data = nullBody ? null : await response.text();
    return new Response(data, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Upstream request failed' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export const GET = proxy;
export const POST = proxy;