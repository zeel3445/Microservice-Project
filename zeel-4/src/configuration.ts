import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();
export default registerAs('memberConfig', () => ({
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
    tcp_port_members: process.env.TCP_PORT_MEMBERS,
    http_port_members: process.env.HTTP_PORT_MEMBERS,
    tcp_port_polcies: process.env.TCP_PORT_POLICIES,
  },
}));
