import { UserModel } from '../model/userModel';
import { IncomingMessage, ServerResponse } from 'node:http';
import * as url from 'url';
import * as types from '../types/types';

export class UserController {
  User: types.IUserModel;

  constructor() {
    this.User = new UserModel();
  }

  async getUser(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<Error | void> {
    try {
      const item = <string>url.parse(<string>req.url, true).query.item;
      const user = await this.User.findUser(item);
      if (!user) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'User not found' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
      }
    } catch (error: unknown) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User is not found' }));
      console.log(error);
      
    }
  }

  createUser(req: IncomingMessage, res: ServerResponse): void | Error {
    try {
      let body = '';
      req.on('data', (data: Buffer) => {
        body += data.toString();
      });
      req.on('end', async () => {
        const { email, password }: types.IUserBody = JSON.parse(body);

        const user: types.IUser | Error | undefined = await this.User.addUser(
          email,
          password,
        );

        if (user instanceof Error) {
          res.writeHead(422, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: user.message }));
        }

        res.writeHead(201, { 'Content-Type': 'application/json' });
        return res.end(
          JSON.stringify({ message: `User with email ${email} was added` }),
        );
      });
    } catch (error:unknown) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'User is not created' }));
      console.log(error);
      
    }
  }

  login(req: IncomingMessage, res: ServerResponse): void | Error {
    try {
      let body = '';
      req.on('data', (data: Buffer) => {
        body += data.toString();
      });
      req.on('end', async () => {
        const { email, password }: types.IUserBody = JSON.parse(body);
        const tokens = await this.User.login(email, password);
        if (tokens instanceof Error) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: tokens.message }));
        } else if (tokens) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(tokens));
        }
      });
    } catch (error:unknown) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Wrong credentials' }));
      console.log(error);
     
    }
  }

  refreshTokens(
    req: IncomingMessage,
    res: ServerResponse,
  ): Error | void | types.IRefreshedTokens {
    try {
      let body = '';
      req.on('data', (data: Buffer) => {
        body += data.toString();
      });
      req.on('end', async () => {
        const token: string = JSON.parse(body).refreshToken;
        const tokens = await this.User.refreshTokens(token);
        if (tokens instanceof Error) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Wrong token' }));
        }
        res.end(JSON.stringify(tokens));
      });
    } catch (error: unknown) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Wrong token' }));
      console.log(error);
   
    }
  }
}
