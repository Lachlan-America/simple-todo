import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Initialize Redis and Ratelimit ONCE when this module is imported
const redis = Redis.fromEnv();

export const todoLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"), // 2 requests per minute for categorization
    analytics: true,
});

export const summaryLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, "5 m"), // 1 request every 5 minutes for summary
    analytics: true,
});