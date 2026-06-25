const redis = require("redis");

class RedisClient {
    constructor() {
        const port = parseInt(process.env.REDIS_PORT, 10) || 6379;
        this.client = redis.createClient({
            socket: { host: process.env.REDIS_HOST || '127.0.0.1', port }
        });
        this._ready = false;
        this.connect();
    }

    get isReady() { return this._ready; }

    async connect() {
        try {
            await this.client.connect();
            this._ready = true;
            console.log("Redis connected");
        } catch (error) {
            this._ready = false;
            console.error("Redis connection failed:", error);
        }
    }

    async get(key) {
        try {
            return await this.client.get(key);
        } catch (error) {
            console.error(`Error fetching key ${key} from Redis:`, error);
            return null;
        }
    }

    async setEx(key, ttl, value) {
        try {
            await this.client.setEx(key, ttl, value);
        } catch (error) {
            console.error(`Error setting key ${key} in Redis:`, error);
        }
    }

    async delete(key) {
        try {
            await this.client.del(key);
        } catch (error) {
            console.error(`Error deleting key ${key} from Redis:`, error);
        }
    }

    // --- List operations (for batch prompt) ---

    async rPush(key, value) {
        try {
            return await this.client.rPush(key, value);
        } catch (error) {
            console.error(`Error rPush to ${key}:`, error);
            return 0;
        }
    }

    /**
     * Atomic SET NX EX — returns true if lock acquired, false otherwise.
     */
    async setNX(key, value, ttl) {
        try {
            const result = await this.client.set(key, value, { NX: true, EX: ttl });
            return result === 'OK';
        } catch (error) {
            console.error(`Error setNX ${key}:`, error);
            return false;
        }
    }

    async lLen(key) {
        try {
            return await this.client.lLen(key);
        } catch (error) {
            console.error(`Error lLen ${key}:`, error);
            return 0;
        }
    }

    async lRange(key, start, stop) {
        try {
            return await this.client.lRange(key, start, stop);
        } catch (error) {
            console.error(`Error lRange ${key}:`, error);
            return [];
        }
    }

    async lTrim(key, start, stop) {
        try {
            return await this.client.lTrim(key, start, stop);
        } catch (error) {
            console.error(`Error lTrim ${key}:`, error);
        }
    }

    async expire(key, ttl) {
        try {
            return await this.client.expire(key, ttl);
        } catch (error) {
            console.error(`Error expire ${key}:`, error);
            return false;
        }
    }
}

// ใช้ Singleton เพื่อให้ Redis Client มีเพียงอินสแตนซ์เดียวในระบบ
module.exports = new RedisClient();
