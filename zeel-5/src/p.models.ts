import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as jf from 'joiful';
import { Pool } from 'pg';
export class PoliciesModel {
  @(jf.number().min(1).max(20).required())
  policyId: number;
  Data: JSON;
  @jf.date()
  createdDt: Date;
  @jf.date()
  modifiedDt: Date;
  @jf.boolean()
  enabled: boolean;
  @(jf.number().min(1).max(20).required())
  customerId: number;
  pool: Pool;

  toJSON(dataOnly: boolean = false) {
    const data: any = {};
    for (const key in this) {
      if (
        ![
          'customerId',
          'data',
          'createdDt',
          'modifiedDt',
          'enabled',
          'policyId',
        ].includes(key) ||
        !dataOnly
      ) {
        data[key] = this[key];
      }
    }
    return data;
  }
  static build(rawData: any): PoliciesModel {
    if (rawData.data !== undefined) {
      Object.assign(rawData, rawData.data);
    }
    const policies = new PoliciesModel();
    (policies.customerId = rawData.customer_id || rawData.customerId),
      (policies.policyId = rawData.policy_id || rawData.policyId),
      (policies.Data = rawData.data || rawData.Data),
      (policies.enabled =
        rawData.enabled !== undefined ? rawData.enabled : true),
      (policies.createdDt =
        rawData.createdDt || rawData.created_dt || new Date());
    policies.modifiedDt =
      rawData.modifiedDt || rawData.modified_dt || new Date();
    const valid = new jf.Validator({
      abortEarly: false,
      allowUnknown: true,
    }).validate(policies);
    if (valid.error) throw new BadRequestException(valid.error.message);
    return policies;
  }
  async save(pool: Pool): Promise<any> {
    const valid = new jf.Validator({
      abortEarly: false,
      allowUnknown: true,
    }).validate(this, { allowUnknown: true });
    if (valid.error) throw new BadRequestException(valid.error.message);
    const existinguser = await pool
      .query(`SELECT  * FROM  s.policy WHERE policy_id = $1 AND enabled=true`, [
        this.policyId,
      ])
      .catch((e) => {
        console.log('error1', e);
        throw new InternalServerErrorException();
      });
    // const data = this.toJSON(true);
    if (existinguser.rows[0]) {
      Object.assign(existinguser, this);
      const result = await pool
        .query(
          `UPDATE s.policy SET enabled = $1, created_dt=$2, data = $3 WHERE policy_id = $4 RETURNING *`,
          [this.enabled, this.createdDt, this.Data, this.policyId],
        )
        .catch((e) => {
          console.log(e);
          throw new BadRequestException();
        });

      return result.rows[0];
    } else {
      await pool
        .query(
          `INSERT INTO s.policy (data, enabled, policy_id,created_dt,modified_dt,customer_id) VALUES ($1, $2, $3,$4,$5,$6) RETURNING *`,
          [
            this.Data,
            this.enabled,
            this.policyId,
            this.createdDt,
            this.modifiedDt,
            this.customerId,
          ],
        )
        .catch((e) => {
          console.log(e);
          throw e.detail;
        });

      return this;
    }
  }
  static async getFromPolicyId(
    pool: Pool,
    policyId: number,
  ): Promise<PoliciesModel | null> {
    const result = await pool
      .query(`SELECT  * FROM  s.policy WHERE policy_id = $1 AND enabled=true`, [
        policyId,
      ])
      .catch((e) => {
        console.log('error1', e);
        throw new InternalServerErrorException();
      });
    if (result.rows.length) {
      const userData = result.rows[0];
      const user = PoliciesModel.build(userData);
      return user;
    }
    return null;
  }
  static async getAllPolicies(pool: Pool): Promise<any> {
    const query = 'SELECT * FROM s.policy WHERE enabled = true';
    const params: PoliciesModel[] = [];
    const result = await pool.query(query, params).catch(() => {
      throw new BadRequestException();
    });
    for (const policy of result.rows) {
      const policies = PoliciesModel.build(policy);
      if (policies) params.push(policies.toJSON(false));
    }
    return params;
  }
}
