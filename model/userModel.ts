const bcrypt = require("bcrypt")
require("dotenv").config()
import {pool} from '../db/pool'
const jwt = require("jsonwebtoken")
const randomString = require("randomstring")
import * as types from '../types/types'

export class UserModel   {
  SECRET: String | undefined
  REFRESH_TOKEN_LIFE_TIME: String|undefined
  
  constructor() {
    this.SECRET = process.env.SECRET
    this.REFRESH_TOKEN_LIFE_TIME = process.env.REFRESH_TOKEN_LIFE_TIME
  }

  async findUser(query: String):Promise<any>{
    try {
      let conn = await pool.getConnection()
      const sql =
        "SELECT * FROM nodeDB.users WHERE userId=? OR email=? OR token=?"
      let [row] = await conn.query(sql, [query, query, query])
      conn.end()
      if (!row) {
        return new Error("User does not exist")
      }
      return row
    } catch (error) {
      console.log("error", error)
    }
  }

  async validateEmail(email:String):Promise<Boolean> {
    const reg =
      /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    return reg.test(String(email).toLowerCase())
  }

  async addUser(email:String, password:String):Promise<void|Error> {
    try {
      const user = await this.findUser(email)
      const lifeTime = Number(process.env.REFRESH_TOKEN_LIFE_TIME)
      const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS))
      const hashPassword = await bcrypt.hash(password, salt, null)

      if ((await this.validateEmail(email)) === false) {
        return new Error(`Email ${email} is invalid`)
      } else if (password.length < 6) {
        return new Error(
          `Password length must be at least 6 characters(you are currently using ${password.length} characters`
        )
      } else if (user) {
        return new Error("User already exist")
      } else {
        let conn = await pool.getConnection()
        const user = [email, hashPassword, Date.now(), lifeTime]
        const sql = `INSERT INTO users (email,password,date,expiresIn) VALUES (?,?,?,?)`
        await conn.query(sql, user)
        conn.end()
      }
    } catch (error:any) {
      return new Error(error.message)
     }
  }

  async isValidPassword(email: String, password: String) {
    try {
      const user = await this.findUser(email)
      if (user instanceof Error) {
        return new Error("User does not exist")
      }
      const isValid = await bcrypt.compare(password, user.password)
      if (!isValid) {
        return new Error("Invalid credentials")
      }
      return user
    } catch (error:any) {
      return new Error(error.message)
     }
  }

  

  async generateAccessToken(user: types.IPayload):Promise<String|Error> {
    try {
      const payload = {
        type: "access",
        id: user.userId,
        lifetime: Number(this.REFRESH_TOKEN_LIFE_TIME) + Date.now(),
      }
      const token = jwt.sign(payload, this.SECRET, { expiresIn: "10h" })
      return token
    } catch (error:any) {
      return new Error(error.message)
     }
  }

  async generateRefreshToken():Promise<String|Error> {
    try {
      const salt:String =await bcrypt.genSalt(10)
      const token:String =await bcrypt.hash(randomString.generate(32), salt, null)
      return token
    } catch (error:any) {
      return new Error(error.message)
     }
  }

  async updateDbRefreshToken(refreshToken:String, user:types.IPayload):Promise<void|Error> {
    let conn = await pool.getConnection()
    try {
      if (user instanceof Error) {
        return new Error("User does not exist")
      }
      const editInfo = [refreshToken, Date.now(), user.userId]
      const sql = `UPDATE users SET token=?,date=? WHERE userId=?`
      await conn.query(sql, editInfo)
      conn.end()
    } catch (error:any) {
      return new Error(error.message)
     }
  }

  async updateTokens(user: types.IPayload): Promise<types.IRefreshedTokens|void|Error> {
    if (user) {
      try {
      if (user instanceof Error) {
        return new Error("User does not exist")
      }
      const accessToken = await this.generateAccessToken(user)
      const refreshToken = await this.generateRefreshToken()
        if (refreshToken) {
          await this.updateDbRefreshToken(<string>refreshToken, user)
          return {
            accessToken,
            refreshToken
          }
        }
     
    } catch (error:any) {
      return new Error(error.message)
     }
    }
  }

  async login(email: String, password: String): Promise<types.IRefreshedTokens|void|Error> {
    try {
      const user = await this.isValidPassword(email, password)
      const isEmailValid = await this.validateEmail(email)
      if (user instanceof Error || isEmailValid === false) {
        return new Error("Wrong credentials")
      }
      const tokens = await this.updateTokens(user)
      return tokens
    } catch (error:any) {
      return new Error(error.message)
     }
  }

  async refreshTokens(refreshToken:String):Promise<types.IRefreshedTokens|void|Error> {
    try {
      const user = await this.findUser(refreshToken)
      if (user instanceof Error) {
        new Error("Invalid Token")
      }
      return await this.updateTokens(user)
    } catch (error:any) {
      return new Error(error.message)
     }
  }
}

