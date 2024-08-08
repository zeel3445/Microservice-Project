import { Pool } from 'pg';
import memberConfig from '../configs/configuration';
import { ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';

export class PostgresService {
  public pool: Pool;
  constructor(
    @Inject(memberConfig.KEY)
    private config: ConfigType<typeof memberConfig>,
  ) {
    this.connect();
  }

  async connect() {
    this.pool = new Pool(this.config.database);
  }
}
