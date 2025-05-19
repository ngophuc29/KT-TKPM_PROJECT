require("dotenv").config(); // Load biến môi trường từ .env
const redis = require("redis");

let client;

const createClient = async () => {
  try {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      throw new Error("Missing REDIS_URL environment variable.");
    }

    const redisClient = redis.createClient({
      url: redisUrl,
      socket: {
        tls: true,
        rejectUnauthorized: false, // Bỏ dòng này nếu dùng chứng chỉ hợp lệ
      },
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis Client Error:", err);
    });

    redisClient.on("connect", () => {
      console.log("✅ Connected to Redis successfully");
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    console.error("⚠️ Failed to create Redis client:", error);
    return createFallbackClient();
  }
};

const createFallbackClient = () => {
  const cache = {};

  return {
    isConnected: false,

    get: async (key) => {
      console.log("⚠️ Using fallback cache for get:", key);
      return cache[key] || null;
    },

    setEx: async (key, ttl, value) => {
      console.log("⚠️ Using fallback cache for setEx:", key);
      cache[key] = value;
      setTimeout(() => {
        delete cache[key];
      }, ttl * 1000);
      return "OK";
    },

    del: async (key) => {
      console.log("⚠️ Using fallback cache for del:", key);
      delete cache[key];
      return 1;
    },
  };
};

const initializeClient = async () => {
  client = await createClient();
  return client;
};

// Init ngay khi load
initializeClient();

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
