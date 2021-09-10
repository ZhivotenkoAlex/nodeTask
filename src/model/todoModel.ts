import { pool } from '../db/pool';
import * as jwt from 'jsonwebtoken'; 
import * as dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/.env' });
import * as types from '../types/types';

export class TodoModel {
  SECRET: string | undefined;

  constructor() {
    this.SECRET = process.env.SECRET;
  }

  async getItemById(id: string): Promise<types.ITodoItem | Error> {
    try {
      const conn = await pool.getConnection();
      const sql = 'SELECT * FROM todo WHERE id=?';
      const dbResponseData: types.ITodoItem = await conn.query(sql, [id]);
      conn.end();
      return dbResponseData;
    } catch (error: unknown) {
      console.log(error);     
    }
  }

  async createItem(title: string, accessToken: string): Promise<void | Error> {
    try {
      const conn = await pool.getConnection();
      const payload = (jwt.verify(
        accessToken.split(' ')[1],
        this.SECRET,
      ) as types.ITodoPayload);

      if (payload instanceof Error) {
        return new Error('Invalid token');
      }
      const item = [title, payload.id];
      const sql = 'INSERT INTO todo (text,userId) VALUES (?,?)';
      await conn.query(sql, item);
      conn.end();
    } catch (error: unknown) {
      console.log(error);     
    }
  }

  async getItems(
    accessToken: string,
  ): Promise<void | Error | Array<types.ITodoItem>> {
    try {
      const user = (jwt.verify(accessToken, this.SECRET) as types.ITodoPayload);
      const userId = user.id;
      if (user instanceof Error) {
        return new Error('Invalid token');
      }

      const conn = await pool.getConnection();
      const sql = 'SELECT * FROM todo WHERE userId=?';
      const dbResponseData: Array<types.ITodoItem> = await conn.query(sql, [
        userId,
      ]);
      const response = dbResponseData.map(item => {
        return item;
      });
      return response;
    } catch (error: unknown) {
      console.log(error);     
    }
  }

  async editElement(title: string, id: string | number): Promise<void | Error> {
    try {
      const conn = await pool.getConnection();
      const editInfo = [title, id];
      const sql = 'UPDATE todo SET text=? WHERE id=?';
      const dbResponse: types.IDbResponse = await conn.query(sql, editInfo);
      if (dbResponse.affectedRows === 0) {
        return new Error('Wrong id');
      }
      conn.end();
    } catch (error: unknown) {
      console.log(error);     
    }
  }

  async setCheck(
    checked: boolean | undefined,
    id: string | number,
  ): Promise<void | Error> {
    try {
      const conn = await pool.getConnection();
      const editInfo = [checked, id];
      const sql = 'UPDATE todo SET checked=? WHERE id=?';
      const dbResponse: types.IDbResponse = await conn.query(sql, editInfo);

      if (dbResponse.affectedRows === 0) {
        return new Error('Wrong id');
      }
      conn.end();
    } catch (error: unknown) {
      console.log(error);     
    }
  }

  async deleteElement(id: string | number): Promise<void | Error> {
    try {
      const conn = await pool.getConnection();
      const sql = 'DELETE FROM todo WHERE id=?';
      const dbResponse: types.IDbResponse = await conn.query(sql, id);
      if (dbResponse.affectedRows === 0) {
        return new Error('Wrong id');
      }
      conn.end();
    } catch (error: unknown) {
      console.log(error);     
    }
  }
}
