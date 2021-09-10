"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoModel = void 0;
const pool_1 = require("../db/pool");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + '/.env' });
class TodoModel {
    constructor() {
        this.SECRET = process.env.SECRET;
    }
    async getItemById(id) {
        try {
            const conn = await pool_1.pool.getConnection();
            const sql = 'SELECT * FROM todo WHERE id=?';
            const dbResponseData = await conn.query(sql, [id]);
            conn.end();
            return dbResponseData;
        }
        catch (error) {
            console.log(error);
        }
    }
    async createItem(title, accessToken) {
        try {
            const conn = await pool_1.pool.getConnection();
            const payload = jwt.verify(accessToken.split(' ')[1], this.SECRET);
            if (payload instanceof Error) {
                return new Error('Invalid token');
            }
            const item = [title, payload.id];
            const sql = 'INSERT INTO todo (text,userId) VALUES (?,?)';
            await conn.query(sql, item);
            conn.end();
        }
        catch (error) {
            console.log(error);
        }
    }
    async getItems(accessToken) {
        try {
            const user = jwt.verify(accessToken, this.SECRET);
            const userId = user.id;
            if (user instanceof Error) {
                return new Error('Invalid token');
            }
            const conn = await pool_1.pool.getConnection();
            const sql = 'SELECT * FROM todo WHERE userId=?';
            const dbResponseData = await conn.query(sql, [
                userId,
            ]);
            const response = dbResponseData.map(item => {
                return item;
            });
            return response;
        }
        catch (error) {
            console.log(error);
        }
    }
    async editElement(title, id) {
        try {
            const conn = await pool_1.pool.getConnection();
            const editInfo = [title, id];
            const sql = 'UPDATE todo SET text=? WHERE id=?';
            const dbResponse = await conn.query(sql, editInfo);
            if (dbResponse.affectedRows === 0) {
                return new Error('Wrong id');
            }
            conn.end();
        }
        catch (error) {
            console.log(error);
        }
    }
    async setCheck(checked, id) {
        try {
            const conn = await pool_1.pool.getConnection();
            const editInfo = [checked, id];
            const sql = 'UPDATE todo SET checked=? WHERE id=?';
            const dbResponse = await conn.query(sql, editInfo);
            if (dbResponse.affectedRows === 0) {
                return new Error('Wrong id');
            }
            conn.end();
        }
        catch (error) {
            console.log(error);
        }
    }
    async deleteElement(id) {
        try {
            const conn = await pool_1.pool.getConnection();
            const sql = 'DELETE FROM todo WHERE id=?';
            const dbResponse = await conn.query(sql, id);
            if (dbResponse.affectedRows === 0) {
                return new Error('Wrong id');
            }
            conn.end();
        }
        catch (error) {
            console.log(error);
        }
    }
}
exports.TodoModel = TodoModel;
//# sourceMappingURL=todoModel.js.map