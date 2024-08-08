import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { set } from 'src/services/redis.service';
import * as jf from 'joiful';
import { Pool } from 'pg';

export class ClaimsModel {
  @(jf.number().min(1).max(20).required())
  claimId: number;
  Data: JSON;
  @jf.date()
  createdDt: Date;
  @jf.date()
  modifiedDt: Date;
  @jf.boolean()
  enabled: boolean;
  @(jf.number().min(1).max(20).required())
  policyId: number;
  customerId: number;
  pool: Pool;

  toJSON(dataOnly: boolean = false) {
    const data: any = {};
    for (const key in this) {
      if (
        ![
          'claimId',
          'Data',
          'createdDt',
          'modifiedDt',
          'enabled',
          'policyId',
          'customerId',
        ].includes(key) ||
        !dataOnly
      ) {
        data[key] = this[key];
      }
    }
    return data;
  }
  static build(rawData: any): ClaimsModel {
    if (rawData.data !== undefined) {
      Object.assign(rawData, rawData.data);
    }
    const claims = new ClaimsModel();
    (claims.claimId = rawData.claimId || rawData.claim_id),
      (claims.policyId = rawData.policy_id || rawData.policyId),
      (claims.Data = rawData.data || rawData.Data),
      (claims.enabled = rawData.enabled !== undefined ? rawData.enabled : true),
      (claims.createdDt =
        rawData.createdDt || rawData.created_dt || new Date());
    claims.modifiedDt = rawData.modifiedDt || rawData.modified_dt || new Date();
    claims.customerId = rawData.customer_id || rawData.customerId;
    const valid = new jf.Validator({
      abortEarly: false,
      allowUnknown: true,
    }).validate(claims);
    if (valid.error) throw new BadRequestException(valid.error.message);
    return claims;
  }
  async save(pool: Pool): Promise<any> {
    const valid = new jf.Validator({
      abortEarly: false,
      allowUnknown: true,
    }).validate(this, { allowUnknown: true });
    if (valid.error) throw new BadRequestException(valid.error.message);
    const existinguser = await pool
      .query(`SELECT  * FROM  s.claim WHERE claim_id = $1 AND enabled=true`, [
        this.claimId,
      ])
      .catch((e) => {
        console.log('error1', e);
        throw new InternalServerErrorException();
      });
    //const data = this.toJSON(true);
    if (existinguser.rows[0]) {
      Object.assign(existinguser, this);
      const result = await pool
        .query(
          `UPDATE s.claim SET enabled = $1, created_dt=$2, data = $3 , customer_id=$4,policy_id=$5WHERE claim_id = $6 RETURNING *`,
          [
            this.enabled,
            existinguser.rows[0].created_dt,
            this.Data,
            this.customerId,
            this.policyId,
            this.claimId,
          ],
        )
        .catch((e) => {
          console.log(e);
          throw new BadRequestException();
        });
      await set(`claims:${this.claimId}`, JSON.stringify(this), 10000);
      return result.rows[0];
    } else {
      await pool
        .query(
          `INSERT INTO s.claim (data, enabled, policy_id,created_dt,modified_dt,claim_id,customer_id) VALUES ($1, $2, $3,$4,$5,$6,$7) RETURNING *`,
          [
            this.Data,
            this.enabled,
            this.policyId,
            this.createdDt,
            this.modifiedDt,
            this.claimId,
            this.customerId,
          ],
        )
        .catch((e) => {
          console.log(e);
          throw e.detail;
        });
      await set(`claims:${this.claimId}`, JSON.stringify(this), 10000);
      return this;
    }
  }
  static async getClaimsById(
    pool: Pool,
    claimId: number,
  ): Promise<ClaimsModel | null> {
    const result = await pool
      .query(`SELECT  * FROM  s.claim WHERE claim_id = $1 AND enabled=true`, [
        claimId,
      ])
      .catch((e) => {
        console.log('error1', e);
        throw new InternalServerErrorException(e.detail);
      });
    if (result.rows.length) {
      const userData = result.rows[0];
      const user = ClaimsModel.build(userData);
      return user;
    }
    return null;
  }
  static async getAllClaims(pool: Pool): Promise<any> {
    const query = `SELECT * FROM s.claim WHERE enabled = true`;
    const params: ClaimsModel[] = [];
    const result = await pool.query(query, params).catch(() => {
      throw new BadRequestException();
    });
    for (const claim of result.rows) {
      const claims = ClaimsModel.build(claim);
      if (claims) params.push(claims.toJSON(false));
    }
    return params;
  }
}
