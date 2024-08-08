import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { Pool } from 'pg';
import { firstValueFrom } from 'rxjs';
import { PoliciesDto } from 'src/dto/policies.dto';
import { PoliciesModel } from 'src/models/policies.models';
import { PostgresService } from 'src/services/pg.service';

@Injectable()
export class PoliciesService {
  pool: Pool;
  authenticatePolicies: ClientProxy;
  constructor(private readonly postgress: PostgresService) {
    this.pool = this.postgress.pool;
    this.PoliciesMiddleware();
  }
  async getAllPolicies(): Promise<any> {
    const val = await PoliciesModel.getAllPolicies(this.pool).catch((e) => {
      console.log(e);
      throw new BadRequestException();
    });
    return val;
  }
  async deletePolicies(id: number): Promise<any> {
    const val = await PoliciesModel.getFromPolicyId(this.pool, id).catch(
      (e) => {
        console.log(e);
        throw new BadRequestException();
      },
    );
    if (!val) {
      return `policies with ${id} doesnot exist or is enabled false`;
    }
    val.enabled = false;
    await PoliciesModel.build(val);
    await val.save(this.pool);
    return val;
  }
  async updatePolicies(policiesdto: PoliciesDto): Promise<any> {
    let exis = new PoliciesModel();
    exis = await PoliciesModel.getFromPolicyId(this.pool, policiesdto.policyId);
    if (!exis) {
      const val = 'policies does not exist';
      return val;
    }
    Object.assign(exis, policiesdto);
    return exis.save(this.pool);
  }

  async insertPolicies(policiesdto: PoliciesDto): Promise<any> {
    if (policiesdto.customerId) {
      console.log(policiesdto);
      const customerid = policiesdto.customerId;
      const customerId = await firstValueFrom(
        this.authenticatePolicies.send(
          { cmd: 'get-customers-by-id' },
          JSON.stringify({ customerid }),
        ),
      ).catch((e) => {
        throw new BadRequestException(e.detail);
        console.log(e);
      });
      console.log('checking customerid');
      console.log(customerId);
      if (customerId == null) {
        throw new BadRequestException('customerid doesnot exist');
      }
    }
    const exis = await PoliciesModel.getFromPolicyId(
      this.pool,
      policiesdto.policyId,
    ).catch((e) => {
      console.log(e);
      throw e;
    });
    if (exis) {
      const val = `policies with policies=${policiesdto.policyId} already exist`;
      return val;
    }
    const val = await PoliciesModel.build(policiesdto);
    await val.save(this.pool).catch((e) => {
      console.log(e);
      throw new BadRequestException(e);
    });
    return val;
  }
  async getPoliciesById(id: number): Promise<any> {
    console.log('in policybyid');
    const exis = await PoliciesModel.getFromPolicyId(this.pool, id).catch(
      (e) => {
        console.log(e);
        throw new BadRequestException();
      },
    );
    console.log(exis);
    if (exis === null) {
      return exis;
      return `customer with id=${id} doesnot exist or enabled false`;
    }
    return exis;
  }
  async PoliciesMiddleware() {
    this.authenticatePolicies = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        port: 3001,
      },
    });
  }
}
