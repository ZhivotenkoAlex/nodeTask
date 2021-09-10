import * as jwt from 'jsonwebtoken'; 
import { IncomingMessage, ServerResponse } from 'node:http';
import { UserModel } from '../model/userModel';
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });
import * as types from '../types/types';


export class VerifyAccess {
  User: { findUser(query: string): Promise<types.IUser | Error > };

  SECRET: string | undefined;

  constructor() {
    this.User = new UserModel();
    this.SECRET = process.env.SECRET;
  }

  async verify(
    req: IncomingMessage,
    res: ServerResponse,
    token: string,
  ): Promise<boolean | Error> {
    try {
      const payload = (jwt.verify(token, this.SECRET) as types.ITodoPayload);
      const user = await this.User.findUser(payload.id);
      if (!payload) {
        return new Error('invalid token');
      }

      if (payload.type !== 'access') {
        return new Error('wrong token');
      }

      if (user instanceof Error){
        return new Error('invalid token');
      } else if (user.date + user.expiresIn < Date.now()){
        return new Error('token expired');
      }  

      if (!user) {
        return new Error('invalid token');
      }
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return new Error('error token');
      }
    }
    return true;
  }
}
