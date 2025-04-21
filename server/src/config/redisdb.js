import { createClient } from 'redis';

const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: "localhost",
        port: 6379
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

export default client;