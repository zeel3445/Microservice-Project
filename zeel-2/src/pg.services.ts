import { Pool } from 'pg';
import { ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import claimsConfig from '../configs/configuration';

export class PostgresService {
  public pool: Pool;
  constructor(
    @Inject(claimsConfig.KEY)
    private config: ConfigType<typeof claimsConfig>,
  ) {
    this.connect();
  }

  async connect() {
    this.pool = new Pool(this.config.database);
  }
}
