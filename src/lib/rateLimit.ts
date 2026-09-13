/**
 * Lightweight in-memory rate limiter with sliding expiration
 * Designed for Next.js API route protection (login, register, checkout, inquiries).
 */

interface RateLimitConfig {
    intervalMs: number;  // Window duration in milliseconds
    maxRequests: number; // Maximum requests allowed per window
}

interface RateLimitRecord {
    count: number;
    resetTime: number;
}

// Global registry of stores keyed by namespace
const globalStore = new Map<string, Map<string, RateLimitRecord>>();

/**
 * Extracts client IP from standard reverse-proxy headers (Vercel, Cloudflare, etc.)
 */
export function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get('x-forwarded-for');
    if (forwardedFor) {
        return forwardedFor.split(',')[0].trim();
    }
    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp.trim();
    }
    return '127.0.0.1';
}

/**
 * Creates a namespaced rate limiter instance
 */
export function createRateLimiter(namespace: string, config: RateLimitConfig) {
    if (!globalStore.has(namespace)) {
        globalStore.set(namespace, new Map<string, RateLimitRecord>());
    }

    const store = globalStore.get(namespace)!;

    return {
        check(identifier: string): { success: boolean; limit: number; remaining: number; reset: number } {
            const now = Date.now();
            const record = store.get(identifier);

            // Periodically sweep expired entries if map grows
            if (store.size > 1000) {
                for (const [key, val] of store.entries()) {
                    if (now > val.resetTime) {
                        store.delete(key);
                    }
                }
            }

            if (!record || now > record.resetTime) {
                const resetTime = now + config.intervalMs;
                store.set(identifier, { count: 1, resetTime });
                return {
                    success: true,
                    limit: config.maxRequests,
                    remaining: config.maxRequests - 1,
                    reset: resetTime,
                };
            }

            if (record.count >= config.maxRequests) {
                return {
                    success: false,
                    limit: config.maxRequests,
                    remaining: 0,
                    reset: record.resetTime,
                };
            }

            record.count += 1;
            return {
                success: true,
                limit: config.maxRequests,
                remaining: config.maxRequests - record.count,
                reset: record.resetTime,
            };
        },
    };
}
