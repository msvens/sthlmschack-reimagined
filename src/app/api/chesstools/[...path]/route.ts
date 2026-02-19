import { NextRequest } from 'next/server';

const CHESSTOOLS_BASE = 'https://api.chesstools.org';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const url = new URL(request.url);

  // Reconstruct path from route segments and always append trailing slash.
  // Some ChessTools endpoints (e.g. player_info/) require it and return 404
  // without it. Endpoints that don't need it return a 307 redirect that fetch
  // follows automatically. This also makes us resilient to upstream proxies
  // (nginx) that strip trailing slashes before the request reaches us.
  const apiPath = path.join('/');
  const target = `${CHESSTOOLS_BASE}/${apiPath}/${url.search}`;
  const response = await fetch(target);
  const data = await response.text();

  return new Response(data, {
    status: response.status,
    headers: { 'Content-Type': response.headers.get('Content-Type') || 'application/json' },
  });
}
