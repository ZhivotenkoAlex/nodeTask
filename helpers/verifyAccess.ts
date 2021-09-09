const jwt = require("jsonwebtoken")
import { IncomingMessage, ServerResponse } from 'node:http'
import {UserModel} from '../model/userModel'
require("dotenv").config()


export class VerifyAccess {
  User:{findUser(query: String):Promise<any>}
  SECRET:String|undefined
  constructor() {     
    this.User = new UserModel()
    this.SECRET = process.env.SECRET
  }

  async verify(req:IncomingMessage, res:ServerResponse, token:String):Promise<Boolean|Error> {
    try {
      const payload = jwt.verify(token, this.SECRET)
      const user = await this.User.findUser(payload.id)
      if (!payload) {
        return new Error("invalid token")
      }

      if (payload.type !== "access") {
        return new Error("invalid token")
      }

      if (user.date + user.expiresIn < Date.now()) {
        return new Error("token expired")
      }
      if (user) {
        return true
      }
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return new Error("error token")
      }
      return new Error("error token")
    }
    return true
  }
}
