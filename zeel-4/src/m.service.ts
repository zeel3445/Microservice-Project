import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { Pool } from 'pg';
import { firstValueFrom } from 'rxjs';
import { MemberDetailsDto } from 'src/dto/memberdetail.dto';
import { MemberdetailsModel } from 'src/model/memberdetails.model';
import { PostgresService } from 'src/services/pg.services';

@Injectable()
export class MembersService {
  pool: Pool;
  authenticateMembers: ClientProxy;
  constructor(private readonly postgress: PostgresService) {
    this.pool = this.postgress.pool;
    this.MembersMiddleware();
  }
  async getAllMemberDetails(): Promise<any> {
    const val = await MemberdetailsModel.getAllMemberDetails(this.pool).catch(
      (e) => {
        console.log(e);
        throw new BadRequestException();
      },
    );
    return val;
  }
  async deleteMemberDetails(id: number): Promise<any> {
    const val = await MemberdetailsModel.getMemberDetailsById(
      this.pool,
      id,
    ).catch((e) => {
      console.log(e);
      throw new BadRequestException();
    });
    if (!val) {
      return `member with ${id} doesnot exist or is enabled false`;
    }
    val.enabled = false;
    await MemberdetailsModel.build(val);
    await val.save(this.pool);
    return val;
  }

  async updateMemberDetails(memberdetaildto: MemberDetailsDto): Promise<any> {
    let exis = new MemberdetailsModel();
    exis = await MemberdetailsModel.getMemberDetailsById(
      this.pool,
      memberdetaildto.memberId,
    );
    if (!exis) {
      return `member with ${memberdetaildto.memberId} doesnot exist or enabled false`;
    }
    Object.assign(exis, memberdetaildto);
    return exis.save(this.pool);
  }

  async insertMemberDetails(memberdetaildto: MemberDetailsDto): Promise<any> {
    if (memberdetaildto.policyId) {
      console.log(memberdetaildto);
      const policiesid = memberdetaildto.policyId;
      const policyId = await firstValueFrom(
        this.authenticateMembers.send(
          { cmd: 'get-policies-by-id' },
          JSON.stringify({ policiesid }),
        ),
      ).catch((e) => {
        console.log(e);
        throw new BadRequestException(e.detail);
      });
      console.log('checking customerid');
      console.log(policyId);
      if (policyId == null) {
        throw new BadRequestException('policyid doesnot exist');
      }
    }

    const exis = await MemberdetailsModel.getMemberDetailsById(
      this.pool,
      memberdetaildto.memberId,
    ).catch((e) => {
      console.log(e);
      throw new BadRequestException(e);
    });
    if (exis) {
      const val = `member with memberid=${memberdetaildto.memberId} already exist`;
      return val;
    }

    const val = MemberdetailsModel.build(memberdetaildto);
    await val.save(this.pool).catch((e) => {
      console.log(e);
      throw new BadRequestException();
    });
    return val;
  }
  async getMemberDetailsById(id: number): Promise<any> {
    const exis = await MemberdetailsModel.getMemberDetailsById(
      this.pool,
      id,
    ).catch((e) => {
      console.log(e);
      throw new BadRequestException();
    });
    if (exis === null) {
      return `Member with id=${id} doesnot exist or enabled false`;
    }
    return exis;
  }

  async MembersMiddleware() {
    this.authenticateMembers = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        port: 3007,
      },
    });
  }
}
