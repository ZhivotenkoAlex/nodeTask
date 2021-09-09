// const UserModel = require("../model/userModel")
import { UserModel } from "../model/userModel"
import {IncomingMessage,ServerResponse} from 'node:http'
import url from "url"

export class UserController {
  User: {
    findUser(query: String): Promise<any>,
    addUser(email: String, password: String): Promise<void | Error>,
    login(email: String, password: String): Promise<{} | void>,
    refreshTokens(refreshToken:String):Promise<{}|void|Error>
  }
  constructor() {
    this.User = new UserModel() 
  }

  async getUser(req:IncomingMessage, res:ServerResponse):Promise<void|String> {
    try {
      const item = <string>url.parse(<string>req.url, true).query.item
  
     
       const user = await this.User.findUser(item)
      
     
      if (!user) {
        res.writeHead(404, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "User not found" }))
      } else {
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(user))
      } 
    } catch (error) {
      console.log(error)
    }
  }

  createUser(req:IncomingMessage, res:ServerResponse):void|String {
    try {
      let body = ""
      req.on("data", (data) => {
        body += data.toString()
      })
      req.on("end", async () => {
        const { email, password } = JSON.parse(body)

        let user = await this.User.addUser(email, password)

        if (user instanceof Error) {
          res.writeHead(422, { "Content-Type": "application/json" })
          return res.end(JSON.stringify({ error: user.message }))
        }

        res.writeHead(201, { "Content-Type": "application/json" })
        return res.end(
          JSON.stringify({ message: `User with email ${email} was added` })
        )
      })
    } catch (error) {
      res.writeHead(500, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "User is not created" }))
      console.log(error)
    }
  }

  login(req:IncomingMessage, res:ServerResponse):void|String {
    try {
      let body = ""
      req.on("data", (data) => {
        body += data.toString()
      })
      req.on("end", async () => {
        const { email, password } = JSON.parse(body)
        const tokens = await this.User.login(email, password)
        if (tokens instanceof Error) {
          res.writeHead(401, { "Content-Type": "application/json" })
          return res.end(JSON.stringify({ error: tokens.message }))
        } else if (tokens) {
          res.writeHead(200, { "Content-Type": "application/json" })
          res.end(JSON.stringify(tokens))
        }
      })
    } catch (error) {
      console.log(error)
      res.writeHead(401, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ message: "Wrong credentials" }))
    }
  }

  refreshTokens(req:IncomingMessage, res:ServerResponse):void|String   {
    try {
      let body = ""
      req.on("data", (data) => {
        body += data.toString()
      })
      req.on("end", async () => {
        const token = JSON.parse(body).refreshToken
        const tokens = await this.User.refreshTokens(token)
        if (tokens instanceof Error) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ error: "Wrong token" }))
        }
        res.end(JSON.stringify(tokens))
      })
    } catch (error) {
      console.log(error)
    }
  }
}
