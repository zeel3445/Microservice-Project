import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { Pool } from 'pg';
import { firstValueFrom } from 'rxjs';
import { ClaimsDto } from 'src/dto/claims.dto';
import { ClaimsModel } from 'src/model/claims.model';
import { PostgresService } from 'src/services/pg.services';

@Injectable()
export class ClaimsService {
  pool: Pool;
  authenticateClaims1: ClientProxy;
  authenticateClaims2: ClientProxy;
  constructor(private readonly postgress: PostgresService) {
    this.pool = this.postgress.pool;
    this.ClaimsMiddleware1();
    this.ClaimsMiddleware2();
  }
  async getAllClaims(): Promise<any> {
    const val = await ClaimsModel.getAllClaims(this.pool).catch((e) => {
      console.log(e);
      throw new BadRequestException();
    });
    return val;
  }
  async deleteClaims(id: number): Promise<any> {
    const val = await ClaimsModel.getClaimsById(this.pool, id).catch((e) => {
      console.log(e);
      throw new BadRequestException();
    });
    if (!val) {
      return `claim with ${id} doesnot exist or is enabled false`;
    }
    val.enabled = false;
    await ClaimsModel.build(val);
    await val.save(this.pool);
    return val;
  }

  async updateClaims(claimdto: ClaimsDto): Promise<any> {
    let exis = new ClaimsModel();
    exis = await ClaimsModel.getClaimsById(this.pool, claimdto.claimId);
    if (!exis) {
      return `member with ${claimdto.claimId} doesnot exist or enabled false`;
    }
    Object.assign(exis, claimdto);
    return exis.save(this.pool);
  }

  async insertClaims(claimdto: ClaimsDto): Promise<any> {
    if (claimdto.customerId) {
      console.log(claimdto);
      const customerid = claimdto.customerId;
      const customerId = await firstValueFrom(
        this.authenticateClaims1.send(
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
    if (claimdto.policyId) {
      console.log(claimdto);
      const policiesid = claimdto.policyId;
      const policiesId = await firstValueFrom(
        this.authenticateClaims2.send(
          { cmd: 'get-policies-by-id' },
          JSON.stringify({ policiesid }),
        ),
      ).catch((e) => {
        throw new BadRequestException(e.detail);
        console.log(e);
      });
      console.log('checking policiesid');
      console.log(policiesId);
      if (policiesId == null) {
        throw new BadRequestException('polciiesid doesnot exist');
      }
    }

    const exis = await ClaimsModel.getClaimsById(
      this.pool,
      claimdto.claimId,
    ).catch((e) => {
      console.log(e);
      throw new BadRequestException(e);
    });
    if (exis) {
      const val = `claim with claimid=${claimdto.claimId} already exist`;
      return val;
    }

    const val = ClaimsModel.build(claimdto);
    await val.save(this.pool).catch((e) => {
      console.log(e);
      throw new BadRequestException();
    });
    return val;
  }
  async getClaimsById(id: number): Promise<any> {
    const exis = await ClaimsModel.getClaimsById(this.pool, id).catch((e) => {
      console.log(e);
      throw new BadRequestException();
    });
    if (exis === null) {
      return `claim with id=${id} doesnot exist or enabled false`;
    }
    return exis;
  }

  async ClaimsMiddleware1() {
    this.authenticateClaims2 = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        port: 3007,
      },
    });
  }
  async ClaimsMiddleware2() {
    this.authenticateClaims1 = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        port: 3001,
      },
    });
  }
}
