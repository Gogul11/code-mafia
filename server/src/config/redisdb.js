import { createClient } from 'redis';

const client = redis.createClient({
    host: "redis",
    port: 6379,
    password: process.env.REDIS_PASSWORD,
  });
  

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

export default client;