import { TodoModel } from "../model/todoModel"
import { VerifyAccess } from "../helpers/verifyAccess"
import { IncomingMessage, ServerResponse } from 'node:http'
import url from "url"
import * as types from '../types/types'

export class TodoController {
  Todo:types.ITodoModel
    Verify: types.IVerifyAccess
  constructor() {
    this.Todo = new TodoModel()
    this.Verify = new VerifyAccess()
  }

  async getItemById(req:IncomingMessage, res:ServerResponse):Promise<String|void> {
    let query = url.parse(<string>req.url, true).query
    let token=(<string>query.Authorization).split(" ")[1]
    try {
      const result = await this.Verify.verify(  
        req,
        res,
        token
      )
      if (result instanceof Error) {
        res.writeHead(401, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ error: result.message }))
      }
      const item = await this.Todo.getItemById(<string>query.id)
      res.end(JSON.stringify(item))
    } catch (err) {
      res.statusCode = 404
      res.end(`There are no item with id=${query.id}`)
    }
  }

  async getItems(req:IncomingMessage, res:ServerResponse):Promise<Array<types.ITodoItem>|void> {
    try { 
      const query = url.parse(<string>req.url, true).query
    const accessToken =(<string>query.Authorization).split(" ")[1]
      const result = await this.Verify.verify(req, res, accessToken)
      if (result instanceof Error) {
        res.writeHead(401, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ error: result.message }))
      }
      if (result) {
        const items = await this.Todo.getItems(accessToken)
        if (items instanceof Error) {
          res.writeHead(404, { "Content-Type": "application/json" })
          return res.end(JSON.stringify({ error: items.message }))
        }
        res.writeHead(200, { "Content-Type": "application/json" })
        return res.end(JSON.stringify(items))
      } else {
        res.writeHead(404, { "Content-Type": "application/json" })
        res.end(JSON.stringify({ message: "Item does not exist" }))
      }
    } catch (error) {
      res.writeHead(404, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: error }))
    }
  }

  async addItem(req:IncomingMessage, res:ServerResponse) {
    try {
      let body = ""
      req.on("data", (data) => {
        body += data.toString()
      })
      req.on("end", async () => {
        const { title, token } = JSON.parse(body)

        const result = await this.Verify.verify(req, res, token.split(" ")[1])
        if (result instanceof Error) {
          res.writeHead(401, { "Content-Type": "application/json" })
          return res.end(JSON.stringify({ error: result.message }))
        }
        await this.Todo.createItem(title, token)
        res.writeHead(201, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ message: `Item ${title} was added` }))
      })
    } catch (error) {
      res.writeHead(404, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "Item is not created" }))
      console.log(error)
    }
  }

  async editItem(req:IncomingMessage, res:ServerResponse) {
    try {
      let body = ""
      req.on("data", (data) => {
        body += data.toString()
      })
      req.on("end", async () => {
        const { title, id, token } = JSON.parse(body)
        const result = await this.Verify.verify(req, res, token.split(" ")[1])
        if (result instanceof Error) {
          res.writeHead(401, { "Content-Type": "application/json" })
          return res.end(JSON.stringify({ error: result.message }))
        }
        let responseDb = await this.Todo.editElement(title, id)
        if (responseDb instanceof Error) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Item does not exist" }))
        }
        res.writeHead(200, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ message: `Item ${title} was changed` }))
      })
    } catch (error) {
      res.writeHead(404, { "Content-Type": "application/json" })
      res.end(JSON.stringify({ message: "Item is not changed" }))
      console.log(error)
    }
  }
  async setCheck(req:IncomingMessage, res:ServerResponse) {
    try {
      let body = ""
      req.on("data", (data) => {
        body += data.toString()
      })
      req.on("end", async () => {
        const { checked, id, token } = JSON.parse(body)
        const result = await this.Verify.verify(req, res, token.split(" ")[1])
        if (result instanceof Error) {
          res.writeHead(401, { "Content-Type": "application/json" })
          return res.end(JSON.stringify({ error: result.message }))
        }
        let responseDb = await this.Todo.setCheck(checked, id)
        if (responseDb instanceof Error) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Item does not exist" }))
        }
        res.writeHead(200, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ message: `Item ${id} was changed` }))
      })
    } catch (error) {
      console.log("error", error)
    }
  }
  async deleteItem(req:IncomingMessage, res:ServerResponse) {
    try {
      let body = ""
      req.on("data", (data) => {
        body += data.toString()
      })
      req.on("end", async () => {
        const { id, token } = JSON.parse(body)
        const result = await this.Verify.verify(req, res, token.split(" ")[1])
        if (result instanceof Error) {
          res.writeHead(401, { "Content-Type": "application/json" })
          return res.end(JSON.stringify({ error: result.message }))
        }
        let responseDb = await this.Todo.deleteElement(id)
        if (responseDb instanceof Error) {
          res.writeHead(404, { "Content-Type": "application/json" })
          res.end(JSON.stringify({ message: "Item does not exist" }))
        }
        res.writeHead(200, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ message: `Item ${id} was deleted` }))
      })
    } catch (error) {
      console.log("error", error)
    }
  }
}

