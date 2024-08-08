import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
dotenv.config();
export default registerAs('claimsConfig', () => ({
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
    http_port_claims: process.env.HTTP_PORT_CLAIMS,
    tcp_port_claims: process.env.TCP_PORT_CLAIMS,
    tcp_port_policies: process.env.TCP_PORT_POLICIES,
    tcp_port_customers: process.env.TCP_PORT_CUSTOMERS,
  },
}));
