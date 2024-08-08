import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as jf from 'joiful';
import { Pool } from 'pg';
import { set } from 'src/services/redis.services';

export class MemberdetailsModel {
  @(jf.number().min(1).max(20).required())
  memberId: number;
  Data: JSON;
  @jf.date()
  createdDt: Date;
  @jf.date()
  modifiedDt: Date;
  @jf.boolean()
  enabled: boolean;
  @(jf.number().min(1).max(20).required())
  policyId: number;
  pool: Pool;

  toJSON(dataOnly: boolean = false) {
    const data: any = {};
    for (const key in this) {
      if (
        ![
          'memberId',
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
  static build(rawData: any): MemberdetailsModel {
    if (rawData.data !== undefined) {
      Object.assign(rawData, rawData.data);
    }
    const memberdetails = new MemberdetailsModel();
    (memberdetails.memberId = rawData.memberId || rawData.member_id),
      (memberdetails.policyId = rawData.policy_id || rawData.policyId),
      (memberdetails.Data = rawData.data || rawData.Data),
      (memberdetails.enabled =
        rawData.enabled !== undefined ? rawData.enabled : true),
      (memberdetails.createdDt =
        rawData.createdDt || rawData.created_dt || new Date());
    memberdetails.modifiedDt =
      rawData.modifiedDt || rawData.modified_dt || new Date();
    const valid = new jf.Validator({
      abortEarly: false,
      allowUnknown: true,
    }).validate(memberdetails);
    if (valid.error) throw new BadRequestException(valid.error.message);
    return memberdetails;
  }
  async save(pool: Pool): Promise<any> {
    const valid = new jf.Validator({
      abortEarly: false,
      allowUnknown: true,
    }).validate(this, { allowUnknown: true });
    if (valid.error) throw new BadRequestException(valid.error.message);
    const existinguser = await pool
      .query(
        `SELECT  * FROM  s.memberdetails WHERE member_id = $1 AND enabled=true`,
        [this.memberId],
      )
      .catch((e) => {
        console.log('error1', e);
        throw new InternalServerErrorException();
      });
    // const data = this.toJSON(true);
    if (existinguser.rows[0]) {
      Object.assign(existinguser, this);
      const result = await pool
        .query(
          `UPDATE s.memberdetails SET enabled = $1, created_dt=$2, data = $3 ,policy_id=$4 WHERE member_id = $5 RETURNING *`,
          [
            this.enabled,
            existinguser.rows[0].created_dt,
            this.Data,
            this.policyId,
            this.memberId,
          ],
        )
        .catch((e) => {
          console.log(e);
          throw new BadRequestException();
        });
      await set(`members:${this.memberId}`, JSON.stringify(this), 10000);
      return result.rows[0];
    } else {
      await pool
        .query(
          `INSERT INTO s.memberdetails (data, enabled, policy_id,created_dt,modified_dt,member_id) VALUES ($1, $2, $3,$4,$5,$6) RETURNING *`,
          [
            this.Data,
            this.enabled,
            this.policyId,
            this.createdDt,
            this.modifiedDt,
            this.memberId,
          ],
        )
        .catch((e) => {
          console.log(e);
          throw e.detail;
        });
      await set(`members:${this.memberId}`, JSON.stringify(this), 10000);
      return this;
    }
  }
  static async getMemberDetailsById(
    pool: Pool,
    memberId: number,
  ): Promise<MemberdetailsModel | null> {
    const result = await pool
      .query(
        `SELECT  * FROM  s.memberdetails WHERE member_id = $1 AND enabled=true`,
        [memberId],
      )
      .catch((e) => {
        console.log('error1', e);
        throw new InternalServerErrorException(e.detail);
      });
    if (result.rows.length) {
      const userData = result.rows[0];
      const user = MemberdetailsModel.build(userData);
      return user;
    }
    return null;
  }
  static async getAllMemberDetails(pool: Pool): Promise<any> {
    const query = `SELECT * FROM s.memberdetails WHERE enabled = true`;
    const params: MemberdetailsModel[] = [];
    const result = await pool.query(query, params).catch(() => {
      throw new BadRequestException();
    });
    for (const member of result.rows) {
      const members = MemberdetailsModel.build(member);
      if (members) params.push(members.toJSON(false));
    }
    return params;
  }
}
