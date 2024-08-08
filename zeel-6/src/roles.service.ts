import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import dayjs from 'dayjs';
import { createDecoder, createVerifier } from 'fast-jwt';
import { Pool } from 'pg';
import { RolesDto } from 'src/dto/roles.dto';
import { RoleModel } from 'src/models/roles.model';
import { PostgresService } from 'src/services/pg.service';
import { hash } from 'bcrypt';

@Injectable()
export class RolesService {
  pool: Pool;
  constructor(private readonly postgress: PostgresService) {
    this.pool = this.postgress.pool;
  }
  private verifier = createVerifier({
    key: process.env.JWT_SECRET || 'SECRET',
  });
  private decoder = createDecoder();

  async register(rolesdto: RolesDto): Promise<any> {
    // const exis = await RoleModel.getRoleById(this.pool, rolesdto.RoleId).catch(
    //   (e) => {
    //     console.log(e);
    //     throw e;
    //   },
    // );
    // if (exis) {
    //   const val = `role with role =${rolesdto.RoleId} already exist`;
    //   return val;
    // }
    const val = await RoleModel.build(rolesdto);
    const hashedPassword = await hash(rolesdto.password, 10);
    val.password = hashedPassword;
    await val.save(this.pool).catch((e) => {
      console.log(e);
      throw new BadRequestException(e);
    });
    return val;
  }
  async getUser(req: any, access_token: string, res: any): Promise<any> {
    const accesstokenDetails =
      await this.getRoleIdFromAccessToken(access_token);
    console.log(accesstokenDetails);
    if (!accesstokenDetails) return;
  }

  async getRoleIdFromAccessToken(access_token: string): Promise<any> {
    let customerId: string,
      tokenExpired: boolean = false,
      expiresAt: number;
    try {
      const accessTokenDetails: any = this.verifier(access_token);
      customerId = accessTokenDetails.customerId;
      expiresAt = accessTokenDetails.exp;
    } catch (e) {
      try {
        tokenExpired = true;
        const accessTokenDetails: any = this.decoder(access_token);
        if (accessTokenDetails) {
          customerId = accessTokenDetails.userId;
          expiresAt = accessTokenDetails.exp;
        }
      } catch (e) {
        console.log(e);
        Logger.error(
          `getUserIdFromAccessToken failed with response: ${JSON.stringify(e)}`,
        );
        return;
      }
    }
    if (expiresAt && dayjs().unix() > expiresAt) tokenExpired = true;
    return { customerId, tokenExpired };
  }
}
