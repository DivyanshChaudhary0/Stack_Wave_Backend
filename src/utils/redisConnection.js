
const { Redis } = require("ioredis")
const config = require("../config/config")

const redis = new Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    password: config.REDIS_PASSWORD
})

redis.connect(() => {
    console.log("Redis connected");
})

module.exports = redis;