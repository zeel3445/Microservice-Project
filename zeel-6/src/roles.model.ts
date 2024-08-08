import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
//import { v4 as uuidv4 } from 'uuid';
import * as jf from 'joiful';
import { set } from 'src/services/redis.service';
export class RoleModel {
  @(jf.number().min(1).max(20).required())
  RoleId: number;
  @jf.boolean()
  enabled: boolean;
  @jf.date()
  createdDt: Date;
  @jf.date()
  modifiedDt: Date;
  @jf.string()
  role: string;
  @jf.string()
  username: string;
  @jf.string()
  password: string;
  toJson(dataOnly: boolean = false) {
    const data: any = {};
    for (const key in this) {
      if (
        !['RoleId', 'createdDt', 'enabled', 'modifiedDt'].includes(key) ||
        !dataOnly
      ) {
        data[key] = this[key];
      }
    }
    return data;
  }
  static build(rawData: any): RoleModel {
    console.log(rawData);
    if (rawData.data != undefined) Object.assign(rawData, rawData.data);
    const rolemodel = new RoleModel();
    rolemodel.RoleId = rawData.roleId || rawData.RoleId || rawData.role_id;
    rolemodel.enabled = rawData.enabled !== undefined ? rawData.enabled : true;
    rolemodel.role = rawData.role || rawData.Role || 'customer';
    rolemodel.username = rawData.username || rawData.userName;
    rolemodel.password = rawData.password || rawData.Password;
    rolemodel.createdDt = rawData.createdDt || rawData.created_dt || new Date();
    rolemodel.modifiedDt =
      rawData.modifiedDt || rawData.modified_dt || new Date();
    console.log(rolemodel);
    const valid = new jf.Validator({
      abortEarly: false,
      allowUnknown: true,
    }).validate(rolemodel);
    if (valid.error) throw new BadRequestException(valid.error.message);
    return rolemodel;
  }
  async save(pool: Pool): Promise<any> {
    console.log(this);
    const valid = new jf.Validator({
      abortEarly: false,
      allowUnknown: true,
    }).validate(this, { allowUnknown: true });
    if (valid.error) throw new BadRequestException(valid.error.message);
    const existinguser = await pool
      .query(`SELECT  * FROM  s.role WHERE role_id = $1 AND enabled=true`, [
        this.RoleId,
      ])
      .catch((e) => {
        console.log('error1', e);
        throw new InternalServerErrorException();
      });
    const data = this.toJson(true);
    if (existinguser.rows[0]) {
      Object.assign(existinguser, this);
      const result = await pool
        .query(
          `UPDATE s.role SET enabled = $1, created_dt=$2, data = $3  WHERE role_id = $4 RETURNING *`,
          [this.enabled, existinguser.rows[0].created_dt, data],
        )
        .catch((e) => {
          console.log(e);
          throw new BadRequestException();
        });

      return result.rows[0];
    } else {
      await pool
        .query(
          `INSERT INTO s.role (data, enabled, role_id,created_dt,modified_dt) VALUES ($1, $2, $3,$4,$5) RETURNING *`,
          [data, this.enabled, this.RoleId, this.createdDt, this.modifiedDt],
        )
        .catch((e) => {
          console.log(e);
          throw e.detail;
        });
      await set(`username:${this.username}`, JSON.stringify(this), 100000);
      return this;
    }
  }
}
