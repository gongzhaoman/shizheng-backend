import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6380, // 与docker-compose.yml中配置的端口一致
});

export default redis;
