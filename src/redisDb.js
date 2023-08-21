const redis = require("redis");

const redisUrl = process.env.REDIS_URL;
const client = redis.createClient({
  url: redisUrl,
});

client.on("error", (err) => {
  console.log(`Redis error: ${err}`);
});

module.exports = client;
