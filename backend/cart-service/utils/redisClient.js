const redis = require("redis");

// Get Redis connection details from environment variables with fallbacks
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";

// Create a Redis client with proper error handling
let client;

const createClient = async () => {
  try {
    console.log(`Connecting to Redis at ${REDIS_HOST}:${REDIS_PORT}`);

    const redisClient = redis.createClient({
      socket: {
        host: REDIS_HOST,
        port: REDIS_PORT,
      },
      password: REDIS_PASSWORD || undefined,
    });

    // Add error handling
    redisClient.on("error", (err) => {
      console.error("Redis Client Error", err);
    });

    // Add connection handling
    redisClient.on("connect", () => {
      console.log("Connected to Redis successfully");
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("Failed to create Redis client:", error);
    // Return a dummy client with the same methods to avoid crashes
    return createFallbackClient();
  }
};

// Create a fallback client that doesn't crash when Redis is unavailable
const createFallbackClient = () => {
  const cache = {};

  return {
    isConnected: false,

    get: async (key) => {
      console.log("Using fallback cache for get:", key);
      return cache[key] || null;
    },

    setEx: async (key, ttl, value) => {
      console.log("Using fallback cache for setEx:", key);
      cache[key] = value;
      // Simulate TTL by scheduling removal
      setTimeout(() => {
        delete cache[key];
      }, ttl * 1000);
      return "OK";
    },

    del: async (key) => {
      console.log("Using fallback cache for del:", key);
      delete cache[key];
      return 1;
    },
  };
};

// Initialize the client
const initializeClient = async () => {
  client = await createClient();
  return client;
};

// Initialize on module load
initializeClient();

// Export the methods we need
module.exports = {
  get: async (key) => {
    try {
      return client ? await client.get(key) : null;
    } catch (error) {
      console.error("Redis get error:", error);
      return null;
    }
  },

  setEx: async (key, ttl, value) => {
    try {
      return client ? await client.setEx(key, ttl, value) : null;
    } catch (error) {
      console.error("Redis setEx error:", error);
      return null;
    }
  },

  del: async (key) => {
    try {
      return client ? await client.del(key) : 0;
    } catch (error) {
      console.error("Redis del error:", error);
      return 0;
    }
  },
};
