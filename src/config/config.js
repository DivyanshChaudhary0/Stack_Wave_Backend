
const _config = {
    PORT: process.env.PORT,
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIARY: process.env.JWT_EXPIARY,
    GMAIL_USER: process.env.GMAIL_USER,
    GMAIL_PASS: process.env.GMAIL_PASS,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    JUDGE0_API_HOST: process.env.JUDGE0_API_HOST,
    JUDGE0_API_KEY: process.env.JUDGE0_API_KEY
}

const config = Object.freeze(_config);

module.exports = config