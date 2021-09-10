import bcrypt = require('bcrypt');
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });
import { pool } from '../db/pool';
import * as jwt from 'jsonwebtoken'; 
import * as randomString from 'randomstring';
import * as types from '../types/types';
  
export class UserModel {
  SECRET: string | undefined;

  REFRESH_TOKEN_LIFE_TIME: string | undefined;

  constructor() {
    this.SECRET = process.env.SECRET;
    this.REFRESH_TOKEN_LIFE_TIME = process.env.REFRESH_TOKEN_LIFE_TIME;
  }

  async findUser(query: string): Promise<types.IUser | Error> {
    try {
      const conn = await pool.getConnection();
      const sql =
        'SELECT * FROM nodeDB.users WHERE userId=? OR email=? OR token=?';
      const [row]: Array<types.IUser> = await conn.query(sql, [
        query,
        query,
        query,
      ]);

      conn.end();
      if (!row) {
        return new Error('User does not exist');
      }
      return row;
    } catch (error: unknown) {
      console.log(error);     
    }
  }

  async validateEmail(email: string): Promise<boolean> {
    const reg =
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    return reg.test(String(email).toLowerCase());
  }

  async addUser(
    email: string,
    password: string,
  ): Promise<types.IUser | undefined | Error> {
    try {
      const user: types.IUser | types.IPayload | Error = await this.findUser(
        email,
      );
      const lifeTime = Number(process.env.REFRESH_TOKEN_LIFE_TIME);
      const salt: string = await bcrypt.genSalt(
        Number(process.env.SALT_ROUNDS),
      );
      const hashPassword: void = await bcrypt.hash(password, salt, null);
      if ((await this.validateEmail(email)) === false) {
        return new Error(`Email ${email} is invalid`);
      } else if (password.length < 6) {
        return new Error(
          `Password length must be at least 6 characters(you are currently using ${password.length} characters`,
        );
      } else if (
        user instanceof Error &&
        user.message === 'User does not exist'
      ) {
        const conn = await pool.getConnection();
        const user = [email, hashPassword, Date.now(), lifeTime];
        const sql = 'INSERT INTO users (email,password,date,expiresIn) VALUES (?,?,?,?)';
        await conn.query(sql, user);
        conn.end(); 
      } else {
        return new Error('User already exist');
      }
    } catch (error: unknown) {
      console.log(error);     
    }
  }

  async isValidPassword(email: string, password: string):Promise<Error | types.IUser> {
    try {
      const user: types.IUser | Error = await this.findUser(email);
      if (user instanceof Error) {
        return new Error('User does not exist');
      }
      const isValid: boolean = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return new Error('Invalid credentials');
      }
      return user;
    } catch (error: unknown) {
      console.log(error);     
    }
  }

  async generateAccessToken(
    user: types.IPayload | types.IUser,
  ): Promise<string | Error> {
    try {
      const payload: types.IUserPayload = {
        type: 'access',
        id: user.userId,
        lifetime: Number(this.REFRESH_TOKEN_LIFE_TIME) + Date.now(),
      };
      const token: string = jwt.sign(payload, this.SECRET, {
        expiresIn: '10h',
      });
      return token;
    } catch (error: unknown) {
      console.log(error);     
    }
  }

  async generateRefreshToken(): Promise< void | Error> {
    try {
      const salt: string = await bcrypt.genSalt(10);
      const token = await bcrypt.hash(
        randomString.generate(32),
        salt,
        null,
      );
      return token;
    } catch (error: unknown) {
      console.log(error);     
    }
  }

  async updateDbRefreshToken(
    refreshToken: string,
    user: types.IPayload | types.IUser,
  ): Promise<void | Error | string> {
    const conn = await pool.getConnection();
    try {
      if (user instanceof Error) {
        return new Error('User does not exist');
      }
      const editInfo = [refreshToken, Date.now(), user.userId];
      const sql = 'UPDATE users SET token=?,date=? WHERE userId=?';
      await conn.query(sql, editInfo);
      conn.end();
    } catch (error: unknown) {
      console.log(error);     
    }
  }

  async updateTokens(
    user: types.IUser | Error,
  ): Promise<types.IRefreshedTokens | undefined | Error> {
    if (user) {
      try {
        if (user instanceof Error) {
          return new Error('User does not exist');
        }
        const accessToken = await this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken();
        if (refreshToken) {
          await this.updateDbRefreshToken(<string><unknown>refreshToken, user);
          return {
            accessToken,
            refreshToken,
          };
        }
      } catch (error: unknown) {
        console.log(error);     
      }
    }
  }

  async login(
    email: string,
    password: string,
  ): Promise<types.IRefreshedTokens | undefined | Error> {
    try {
      const user = await this.isValidPassword(email, password);
      const isEmailValid = await this.validateEmail(email);
      if (user instanceof Error || isEmailValid === false) {
        return new Error('Wrong credentials');
      }
      const tokens = await this.updateTokens(user);
      return tokens;
    } catch (error: unknown) {
      console.log(error);     
    }
  }

  async refreshTokens(
    refreshToken: string,
  ): Promise<types.IRefreshedTokens | undefined | Error> {
    try {
      const user: types.IUser | Error = await this.findUser(refreshToken);
      if (user instanceof Error) {
        new Error('Invalid Token');
      }
      return await this.updateTokens(user);
    } catch (error: unknown) {
      console.log(error);     
    }
  }
}
