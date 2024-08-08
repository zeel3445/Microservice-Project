import { Pool } from 'pg';
import { ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import authConfig from '../configs/configuration';

export class PostgresService {
  public pool: Pool;
  constructor(
    @Inject(authConfig.KEY)
    private config: ConfigType<typeof authConfig>,
  ) {
    this.connect();
  }

  async connect() {
    this.pool = new Pool(this.config.database);
  }
}
