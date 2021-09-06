const Todo = require("../model/todoModel")
const url = require("url")
const { verifyAccess } = require("../helpers/verifyAccess")
const { JsonWebTokenError } = require("jsonwebtoken")

async function getItemById(req, res) {
  let query = url.parse(req.url, true).query

  try {
    const result = await verifyAccess(
      req,
      res,
      query.Authorization.split(" ")[1]
    )
    if (result instanceof Error) {
      res.writeHead(401, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: result.message }))
    }
    const item = await Todo.getItemById(query.id)
    res.end(JSON.stringify(item))
  } catch (err) {
    res.statusCode = 404
    res.end(`There are no item with id=${query.id}`)
  }
}

async function getItems(req, res) {
  try {
    const accessToken = url
      .parse(req.url, true)
      .query.Authorization.split(" ")[1]
    const result = await verifyAccess(req, res, accessToken)
    if (result instanceof Error) {
      res.writeHead(401, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: result.message }))
    }
    if (result) {
      const items = await Todo.getItems(accessToken)
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
    res.end(JSON.stringify({ message: error.message }))
  }
}

function addItem(req, res) {
  try {
    let body = ""
    req.on("data", (data) => {
      body += data.toString()
    })
    req.on("end", async () => {
      const { title, token } = JSON.parse(body)

      const result = await verifyAccess(req, res, token.split(" ")[1])
      if (result instanceof Error) {
        res.writeHead(401, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ error: result.message }))
      }
      await Todo.createItem(title, token)
      res.writeHead(201, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ message: `Item ${title} was added` }))
    })
  } catch (error) {
    res.writeHead(404, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ message: "Item is not created" }))
    console.log(error)
  }
}

async function editItem(req, res) {
  try {
    let body = ""
    req.on("data", (data) => {
      body += data.toString()
    })
    req.on("end", async () => {
      const { title, id, token } = JSON.parse(body)
      const result = await verifyAccess(req, res, token.split(" ")[1])
      if (result instanceof Error) {
        res.writeHead(401, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ error: result.message }))
      }
      let responseDb = await Todo.editElement(title, id)
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

async function setCheck(req, res) {
  try {
    let body = ""
    req.on("data", (data) => {
      body += data.toString()
    })
    req.on("end", async () => {
      const { checked, id, token } = JSON.parse(body)
      const result = await verifyAccess(req, res, token.split(" ")[1])
      if (result instanceof Error) {
        res.writeHead(401, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ error: result.message }))
      }
      let responseDb = await Todo.setCheck(checked, id)
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

async function deleteItem(req, res) {
  try {
    let body = ""
    req.on("data", (data) => {
      body += data.toString()
    })
    req.on("end", async () => {
      const { id, token } = JSON.parse(body)
      const result = await verifyAccess(req, res, token.split(" ")[1])
      if (result instanceof Error) {
        res.writeHead(401, { "Content-Type": "application/json" })
        return res.end(JSON.stringify({ error: result.message }))
      }
      let responseDb = await Todo.deleteElement(id)
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

module.exports = {
  addItem,
  getItems,
  getItemById,
  editItem,
  setCheck,
  deleteItem,
}
