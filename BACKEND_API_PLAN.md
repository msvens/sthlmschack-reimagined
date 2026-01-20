# Backend API Service - Design Document

## Context & Problem Statement

The Stockholm Chess Reimagined Next.js frontend currently calls the schack.se API directly. This creates several challenges:

1. **API Hammering**: Repeatedly fetching the same data (player profiles, ratings, etc.) on every page load
2. **Limited Batch Operations**: The remote API doesn't support fetching multiple items at once (e.g., getting 10 player profiles requires 10 separate API calls)
3. **Static Data**: Much of the data is static or changes infrequently:
   - Player ELO ratings update once per month
   - Historical player data rarely changes
   - Tournament results are immutable once published
4. **No Control**: We have no control over rate limiting, caching, or optimization

## Proposed Solution

Build a Go-based backend API service that acts as a smart caching layer/proxy between the Next.js frontend and the schack.se API.

## Why Go? (Decision Rationale)

### Technical Fit
- **Perfect for middleware**: This is exactly what Go was designed for (Docker, Kubernetes, API gateways all use Go)
- **Concurrency**: Goroutines are ideal for batching multiple upstream API calls in parallel
- **Performance**: More efficient memory usage and predictable performance (no serverless cold starts)
- **Caching Control**: Can implement sophisticated caching strategies (LRU, TTL-based, cache warming)

### Architectural Benefits
- **Separation of Concerns**: Backend API logic separate from frontend rendering
- **Independent Lifecycles**: Cache tuning, rate limiting, batch endpoints can evolve independently
- **Independent Scaling**: Cache layer and Next.js app can scale differently
- **Multiple Consumers**: Can later serve mobile apps or other clients
- **Background Jobs**: Easy to add scheduled tasks for cache warming, monthly rating refreshes

### Developer Experience
- **Existing Expertise**: Developer already comfortable with Go
- **OpenAPI Support**: Go has excellent OpenAPI/Swagger tooling (swaggo, go-swagger)
- **Standard Patterns**: Well-established patterns for metrics, logging, health checks
- **Type Generation**: Can generate TypeScript types from OpenAPI spec for frontend

## Architecture Overview

```
┌─────────────────┐
│   Next.js App   │
│   (Frontend)    │
└────────┬────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────┐
│   Go API        │
│   Backend       │
│   - Caching     │
│   - Batching    │
│   - Rate Limit  │
└────────┬────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────┐
│  schack.se API  │
│  (Remote)       │
└─────────────────┘
```

## Key Features to Implement

### 1. Smart Caching
- **Player Profiles**: Cache with monthly TTL (data changes monthly)
- **Tournament Results**: Cache indefinitely (immutable once published)
- **Rating Lists**: Cache with 1-month TTL
- **Organizations Data**: Cache with daily/weekly TTL
- Implement cache warming for frequently accessed data

### 2. Batch Operations
- `GET /api/players/batch?ids=123,456,789` - Fetch multiple players in parallel
- `GET /api/ratings/batch?memberIds=123,456` - Fetch multiple player ratings
- Reduces frontend API calls from N to 1

### 3. Enhanced Endpoints
- Filter/search capabilities not available in upstream API
- Aggregated data (e.g., player stats across tournaments)
- Pre-computed expensive queries

### 4. Rate Limiting & Resilience
- Respect upstream API rate limits
- Request queuing/throttling
- Circuit breaker for upstream failures
- Graceful degradation (serve stale cache if upstream down)

### 5. Background Jobs
- Scheduled cache warming (e.g., top players, recent tournaments)
- Monthly rating refresh job
- Data consistency checks

## Technical Stack

### Core
- **Language**: Go 1.22+
- **Web Framework**: Chi or Gin (lightweight, fast)
- **Cache**: Redis (persistent, distributed) or in-memory with sync to disk
- **OpenAPI**: swaggo for documentation generation

### Infrastructure
- **Docker**: Containerized deployment
- **Health Checks**: `/health`, `/ready` endpoints
- **Metrics**: Prometheus-compatible metrics
- **Logging**: Structured logging (zerolog or zap)

### Development
- **API Documentation**: Auto-generated Swagger UI
- **Type Safety**: Generate TypeScript types for frontend from OpenAPI spec
- **Testing**: Unit tests + integration tests with mocked upstream API

## Data Flow Examples

### Example 1: Player Profile Request
```
Frontend: GET /api/players/12345
    ↓
Go Backend: Check cache
    ↓ (cache miss)
Go Backend: Fetch from schack.se API
    ↓
Go Backend: Store in cache (TTL: 30 days)
    ↓
Go Backend: Return to frontend
```

### Example 2: Tournament Results with Players (Batch)
```
Frontend: GET /api/tournaments/456/results
    ↓
Go Backend: Fetch tournament results (cached)
    ↓
Go Backend: Extract player IDs [123, 456, 789]
    ↓
Go Backend: Batch fetch players (3 parallel requests to schack.se)
    ↓
Go Backend: Merge data + cache
    ↓
Go Backend: Return enriched results
```

## Migration Strategy

### Phase 1: Infrastructure
1. Set up Go project with Chi/Gin
2. Implement basic proxy for 1-2 endpoints
3. Add Redis caching layer
4. Deploy alongside Next.js app

### Phase 2: Core Endpoints
1. Implement player profile endpoints with caching
2. Add batch operations for players
3. Implement rating list endpoints
4. Add tournament results endpoints

### Phase 3: Enhanced Features
1. Background jobs for cache warming
2. Advanced filtering/search
3. Pre-computed aggregations
4. Monitoring & metrics

### Phase 4: Frontend Migration
1. Update Next.js services to point to Go backend
2. Remove direct schack.se API calls
3. Performance testing & optimization

## References to Existing Codebase

### Current API Services (Next.js)
Located in `/src/lib/api/services/`:
- `players.ts` - Player profile fetching
- `ratings.ts` - Rating list fetching
- `tournaments.ts` - Tournament data
- `organizations.ts` - Districts and clubs

### Current API Types
Located in `/src/lib/api/types/`:
- `players.ts` - PlayerInfoDto, PlayerProfileDto
- `ratings.ts` - RatingType, PlayerCategory enums
- `tournaments.ts` - Tournament DTOs
- `organizations.ts` - ClubDTO, DistrictDTO

### Base Service
`/src/lib/api/BaseApiService.ts` - Shows current request patterns, error handling, response structure

## OpenAPI Specification Notes

When building the Go API:
1. Use the existing TypeScript types as reference for DTOs
2. Generate OpenAPI spec from Go code (using swaggo annotations)
3. Generate TypeScript types from OpenAPI for frontend consumption
4. Maintain API compatibility with schack.se where possible (for easier migration)

## Environment Configuration

Go backend will need:
```
SCHACKSE_API_URL=https://api.schack.se/v1
REDIS_URL=redis://localhost:6379
PORT=8080
LOG_LEVEL=info
CACHE_DEFAULT_TTL=86400
RATE_LIMIT_PER_MINUTE=100
```

Next.js frontend will need:
```
NEXT_PUBLIC_API_URL=http://localhost:8080  # Point to Go backend
```

## Success Metrics

- **Reduced Upstream Calls**: 80%+ reduction in calls to schack.se
- **Response Time**: <100ms for cached responses
- **Cache Hit Rate**: >90% for player profiles and tournament results
- **Availability**: 99.9% uptime (better than direct dependency on schack.se)

## Questions to Address in Implementation

1. **Cache Storage**: Redis (distributed, persistent) vs in-memory (simpler, cheaper)?
2. **Deployment**: Single instance initially or distributed from start?
3. **Authentication**: Do we need auth between Next.js and Go backend, or rely on network isolation?
4. **Monitoring**: What metrics are most important to track?
5. **Cache Invalidation**: Manual admin endpoints or fully automatic?

## Next Steps

1. Create new Go project repository
2. Set up basic Chi/Gin server with health checks
3. Implement 1-2 proxy endpoints (e.g., player profile)
4. Add Redis caching
5. Test with Next.js frontend
6. Iterate and expand

---

**Document Author**: Claude Sonnet 4.5
**Date**: 2026-01-14
**Status**: Planning Phase