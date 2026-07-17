import Redis from "ioredis";
import { logger } from "../utils/logger";
import "dotenv/config";

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_DB } = process.env;

// Check that Redis credentials exist in environment variables
if (!REDIS_HOST || !REDIS_PORT || !REDIS_PASSWORD) {
  throw new Error("Please provide Redis credentials in .env");
}

// 1. Core connection options for the ioredis client
const redisConfig = {
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
  password: REDIS_PASSWORD,
  db: Number(REDIS_DB || 2), // Default to Redis DB slot 2 to separate from other services
  
  // CRITICAL FOR BULLMQ:
  // BullMQ workers run blocking commands (like BRPOPLPUSH). If maxRetriesPerRequest is set to 
  // a number, the connection will drop during blocking pauses. Setting it to null prevents this.
  maxRetriesPerRequest: null,
  
  // Custom connection retry backoff logic
  retryStrategy: (times: number) => {
    // Increase delay as connection attempts fail (cap at 2 seconds)
    const delay = Math.min(times * 50, 2000);
    logger.warn("Redis retrying connection...");
    return delay;
  },
};

// 2. Instantiate isolated connection sockets
// We create separate connections to prevent blocking commands (Pub/Sub and Queues) 
// from freezing standard caching requests on the main client connection.
export const redis = new Redis(redisConfig);
export const redisPubSub = new Redis(redisConfig);

// 3. Lifecycle event logging for Main client
redis.on("connect", () => logger.info("Main Redis connected"));
redis.on("ready", () => logger.info("Main Redis ready"));
redis.on("error", (err: { message: string }) =>
  logger.error("Main Redis error:" + err.message)
);

// 4. Lifecycle event logging for Pub/Sub client
redisPubSub.on("connect", () => logger.info("Pub/Sub Redis connected"));
redisPubSub.on("ready", () => logger.info("Pub/Sub Redis ready"));
redisPubSub.on("error", (err: { message: string }) =>
  logger.error("Pub/Sub Redis error:" + err.message)
);

export default redis;
