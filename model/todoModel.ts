import {pool} from '../db/pool'
const jwt = require("jsonwebtoken")
require("dotenv").config()
import * as types from '../types/types'

export class TodoModel {
  SECRET: String | undefined
  constructor() {
       this.SECRET = process.env.SECRET
  }

  async getItemById(id: String): Promise<types.ITodoItem|Error> {
    try {
      let conn = await pool.getConnection()  
      const sql:string = `SELECT * FROM todo WHERE id=?`
      let row:types.ITodoItem = await conn.query(sql, [id])     
      conn.end()
      return row  
    } catch (error:any) {
      return new Error(error.message)
     }
  }

  async createItem(title:String, accessToken:String):Promise<void|Error> {
    try {
      let conn = await pool.getConnection()
      const payload:types.ITodoPayload = jwt.verify(accessToken.split(" ")[1], this.SECRET)
    
      if (payload instanceof Error) {
        return new Error("Invalid token")
      }
      const item = [title, payload.id]
      const sql:string = `INSERT INTO todo (text,userId) VALUES (?,?)`
      await conn.query(sql, item)
      conn.end()
    } catch (error:any) {
      return new Error(error.message)
     }
  }

  async getItems(accessToken: String): Promise<void|Error|Array<types.ITodoItem>> {
    try {
      const userId:String = jwt.verify(accessToken, this.SECRET).id
      if (userId instanceof Error) {
        return new Error("Invalid token")
      }

      let conn = await pool.getConnection()
      const sql:string = `SELECT * FROM todo WHERE userId=?`
      let rows:Array<types.ITodoItem> = await conn.query(sql, [userId])
      let response = rows.map((item) => {
        return item
      })
      return response
    } catch (error:any) {
     return new Error(error.message)
    }
  }
  async editElement(title:String, id:String|Number):Promise<void|Error> {
    try {
      let conn = await pool.getConnection()
      const editInfo = [title, id]
      const sql:string = `UPDATE todo SET text=? WHERE id=?`
      let rows = await conn.query(sql, editInfo)
      if (rows.affectedRows === 0) {
        return new Error("Wrong id")
      }
      conn.end()
    } catch (error:any) {
      return new Error(error.message)
     }
  }
  async setCheck(checked:Boolean, id:String|Number):Promise<void|Error> {
    try {
      let conn = await pool.getConnection()
      const editInfo = [checked, id]
      const sql:string= `UPDATE todo SET checked=? WHERE id=?`
      let rows = await conn.query(sql, editInfo)
      if (rows.affectedRows === 0) {
        return new Error("Wrong id")
      }
      conn.end()
    } catch (error:any) {
      return new Error(error.message)
     }
  }
  async deleteElement(id:String|Number):Promise<void|Error> {
    try {
      let conn = await pool.getConnection()
      const sql = `DELETE FROM todo WHERE id=?`
      let rows = await conn.query(sql, id)
      if (rows.affectedRows === 0) {
        return new Error("Wrong id")
      }
      conn.end()
    } catch (error:any) {
      return new Error(error.message)
     }
  }
}
