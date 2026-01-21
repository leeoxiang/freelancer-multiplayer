const { promisify } = require("util");
const redis = require("redis");

// Support Railway's REDIS_URL or local development
const redisConfig = process.env.REDIS_URL
  ? process.env.REDIS_URL
  : { host: 'localhost', port: 6379 };

const client = redis.createClient(redisConfig);
[
  "get",
  "set",
  "del",
  "keys",
  "mget",
  "getset",
  "multi",
  "hset",
  "hget",
  "hmget",
].forEach((fn) => (client[fn] = promisify(client[fn])));

client.on("error", function (error) {
  console.error(error);
});

client.lock = async (name) => {
  const lock = await client.getset(`lock:${name}`, "locked");
  return !lock;
};

client.release = async (name) => {
  return client.del(`lock:${name}`);
};

module.exports = client;
