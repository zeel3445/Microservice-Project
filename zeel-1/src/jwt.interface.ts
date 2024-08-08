import { UserModel } from 'src/models/auth.models';

export interface JwtPayload {
  username: string;
  userid: string;
}
export function createJwtPayload(user: UserModel) {
  return {
    username: user.username,
    userid: user.UserId,
    roleid: user.roleId,
  };
}
