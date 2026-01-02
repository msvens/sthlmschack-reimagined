/**
 * API Configuration Constants
 *
 * ARCHITECTURE:
 * - Frontend calls local proxy URLs (/api/chess/v1 or /api/chess-dev/v1)
 * - Next.js rewrites these to remote APIs (see next.config.ts)
 * - This avoids CORS issues and keeps browser happy
 * - Tests use direct API URLs (no Next.js server running)
 *
 * TO SWITCH ENVIRONMENTS:
 * - For frontend: Change CURRENT_API_URL to SSF_PROXY_URL or SSF_DEV_PROXY_URL
 * - For tests: Change CURRENT_TEST_API_URL to SSF_PROD_API_URL or SSF_DEV_API_URL
 */

// API Versions
export const API_VERSION = 'v1';           // Production API version
export const API_VERSION_DEV = 'v1';       // Dev API version

// Remote API URLs (for testing - direct API calls)
export const SSF_PROD_API_URL = `https://member.schack.se/public/api/${API_VERSION}`;
export const SSF_DEV_API_URL = `https://halvarsson.no-ip.com/webapp/memdb/public/api/${API_VERSION_DEV}`;

// Current remote API for tests (switch here for testing)
export const CURRENT_TEST_API_URL = SSF_PROD_API_URL;
// export const CURRENT_TEST_API_URL = SSF_DEV_API_URL;

// Local proxy URLs (for frontend - Next.js rewrites to remote APIs)
export const SSF_PROXY_URL = `/api/chess/${API_VERSION}`;
export const SSF_DEV_PROXY_URL = `/api/chess-dev/${API_VERSION_DEV}`;

// Current API URL used by services (switch here to change environment)
export const CURRENT_API_URL = SSF_PROXY_URL;
// export const CURRENT_API_URL = SSF_DEV_PROXY_URL;

export const DEFAULT_TIMEOUT = 10000;

// Legacy exports (deprecated - use CURRENT_API_URL or CURRENT_TEST_API_URL instead)
/** @deprecated Use CURRENT_TEST_API_URL instead */
export const SSF_API_BASE_URL = SSF_PROD_API_URL;
/** @deprecated Use CURRENT_API_URL instead */
export const SSF_LOCAL_API_BASE_URL = SSF_PROXY_URL;
