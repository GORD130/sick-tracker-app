import { createClient } from 'redis'

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.log('Redis connection failed after 10 retries, continuing without Redis')
        return false
      }
      return Math.min(retries * 100, 3000)
    }
  }
})

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err.message)
})

redisClient.on('connect', () => {
  console.log('Redis connected successfully')
})

let isRedisConnected = false

export const connectRedis = async () => {
  try {
    await redisClient.connect()
    isRedisConnected = true
  } catch (error) {
    console.error('Failed to connect to Redis, continuing without cache:', error instanceof Error ? error.message : String(error))
    isRedisConnected = false
  }
}

export const redis = redisClient
export { isRedisConnected }

// Cache utility functions
export const cacheGet = async (key: string): Promise<string | null> => {
  try {
    return await redis.get(key)
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

export const cacheSet = async (key: string, value: string, expireSeconds?: number): Promise<void> => {
  try {
    if (expireSeconds) {
      await redis.set(key, value, { EX: expireSeconds })
    } else {
      await redis.set(key, value)
    }
  } catch (error) {
    console.error('Redis set error:', error)
  }
}

export const cacheDelete = async (key: string): Promise<void> => {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Redis delete error:', error)
  }
}