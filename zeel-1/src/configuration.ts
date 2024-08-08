import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();
export default registerAs('authConfig', () => ({
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    name: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    user: process.env.DATABASE_USER,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  },
  port: {
    http_port_auths: process.env.HTTP_PORT_AUTHS,
    tcp_port_auths: process.env.TCP_PORT_AUTHS,
  },
}));
