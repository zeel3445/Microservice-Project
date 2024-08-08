import { v4 as uuidv4 } from 'uuid';
import * as jf from 'joiful';
import { BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { redisClient } from 'src/services/redis.service';

export class UserModel {
  @(jf.string().min(8))
  password: string;
  @jf.string()
  UserId: string;
  // @jf.string().min(8)
  name: string;
  @(jf.string().required())
  username: string;
  @jf.number()
  age: number;
  @jf.string()
  gender: string;
  @jf.string()
  role: string;
  @jf.date()
  createdDt: Date;
  @jf.date()
  modifiedDt: Date;
  @jf.boolean()
  enabled: boolean;
  roleId: number;
  pool: Pool;

  toJSON(dataOnly: boolean = false) {
    const data: any = {};
    for (const key in this) {
      if (
        !['UserId', 'enabled', 'createdDt', 'modifiedDt'].includes(key) ||
        !dataOnly
      ) {
        data[key] = this[key];
      }
    }
    return data;
  }

  static build(rawData: any): UserModel {
    if (rawData.data !== undefined) {
      Object.assign(rawData, rawData.data);
    }
    const user = new UserModel();
    (user.UserId = rawData.user_id || rawData.UserId || uuidv4()),
      (user.username = rawData.username),
      (user.password = rawData.password),
      (user.enabled = rawData.enabled !== undefined ? rawData.enabled : true);
    user.roleId = rawData.roleid || rawData.roleId;
    user.createdDt = rawData.createdDt || rawData.created_dt || new Date();
    user.modifiedDt = rawData.modifiedDt || rawData.modified_dt || new Date();
    const valid = new jf.Validator({
      abortEarly: false,
      allowUnknown: true,
    }).validate(user);
    if (valid.error) throw new BadRequestException(valid.error.message);
    return user;
  }
  async save(pool: Pool): Promise<any> {
    const valid = new jf.Validator({
      abortEarly: false,
      allowUnknown: true,
    }).validate(this, { allowUnknown: true });
    if (valid.error) throw new BadRequestException(valid.error.message);
    const data = this.toJSON(true);
    await pool.query(
      'INSERT INTO s.auth (data, enabled, user_id,created_dt,modified_dt) VALUES ($1, $2, $3,$4,$5) RETURNING *',
      [data, this.enabled, this.UserId, this.createdDt, this.modifiedDt],
    );
    return this;
  }
  static async getuserByUsername(pool: Pool, username: string): Promise<any> {
    console.log('5');
    const result = await pool.query(
      "select * from s.auth where data->>'username'=$1 AND enabled=true ",
      [username],
    );
    if (result.rows.length) {
      const userData = result.rows[0];
      const user = UserModel.build(userData);
      return user;
    }
    return null;
  }
}
