import { Pool } from 'pg';
import { ConfigType } from '@nestjs/config';
import { Inject } from '@nestjs/common';
import rolesConfig from '../configs/configuration';

export class PostgresService {
  public pool: Pool;
  constructor(
    @Inject(rolesConfig.KEY)
    private config: ConfigType<typeof rolesConfig>,
  ) {
    console.log('hello');
    this.connect();
  }

  async connect() {
    console.log('hello');
    this.pool = new Pool(this.config.database);
  }
}
