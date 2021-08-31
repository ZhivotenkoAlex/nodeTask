const http = require("http")
const url = require("url")

// const bcrypt = require("bcrypt")
// const jwt = require("jsonwebtoken")

const {
  getItemById,
  getItems,
  AddItemToDB,
  editElement,
  setCheck,
  deleteElement,
} = require("./helpers/todo")
const { addUser } = require("./helpers/users")
const { login, refreshTokens, verifyAccess } = require("./helpers/auth")

const port = 8080

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "application/json")
  res.setHeader("Access-Control-Allow-Credentials", "true")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "*")

  if (req.method === "OPTIONS") {
    res.writeHead(204)
    res.end()
    return
  }

  if (["GET", "POST", "PUT", "DELETE"].indexOf(req.method) > -1) {
    let body = null
    let pathname = url.parse(req.url, true).pathname

    if (pathname === "/api/todo" && req.method === "GET") {
      req.on("data", async (data) => {
        body = JSON.parse(data)
      })
      req.on("end", async () => {
        const result = await verifyAccess(req, res)
        if (result) {
          await getItemById(req, res)
        } else {
          res.statusCode = 401
          res.end("token error")
        }
      })
    } else if (pathname === "/api/todo/user" && req.method === "GET") {
      req.on("data", async (data) => {
        body = JSON.parse(data)
      })
      req.on("end", async () => {
        const result = await verifyAccess(req, res)
        if (result) {
          await getItems(req, res)
        } else {
          res.statusCode = 401
          res.end("token error")
        }
      })
    } else if (pathname === "/api/todo" && req.method === "POST") {
      req.on("data", async (data) => {
        body = JSON.parse(data)
      })
      req.on("end", async () => {
        const result = await verifyAccess(req, res, body)
        if (result) {
          AddItemToDB(body)
          res.end(`todo item '${body.title}' was added`)
        } else {
          res.statusCode = 401
          res.end("verify error")
        }
      })
    } else if (pathname === "/api/todo" && req.method === "PUT") {
      req.on("data", async (data) => {
        body = JSON.parse(data)
      })
      req.on("end", async () => {
        const result = await verifyAccess(req, res, body)
        if (result) {
          editElement(body)
          res.end(`todo item with id='${body.id}' was modified`)
        } else {
          res.statusCode = 401
          res.end("token error")
        }
      })
    } else if (pathname === "/api/todo/check" && req.method === "PUT") {
      req.on("data", async (data) => {
        body = JSON.parse(data)
      })
      req.on("end", async () => {
        const result = await verifyAccess(req, res, body)
        if (result) {
          setCheck(body)
          res.end(`todo item with id='${body.id}' was modified`)
        } else {
          res.statusCode = 401
          res.end("token error")
        }
      })
    } else if (pathname === "/api/todo" && req.method === "DELETE") {
      req.on("data", async (data) => {
        body = JSON.parse(data)
      })
      req.on("end", async () => {
        const result = await verifyAccess(req, res, body)
        if (result) {
          deleteElement(body)
          res.end(`todo item with id='${body.id}' was deleted`)
        } else {
          res.statusCode = 401
          res.end("token error")
        }
      })
    } else if (pathname === "/auth" && req.method === "POST") {
      req.on("data", async (data) => {
        body = JSON.parse(data)
      })
      req.on("end", async () => {
        const result = await addUser(body)
        if (result) {
          res.end("user was added")
        } else {
          res.end(`user alredy exist`)
        }
      })
    } else if (pathname === "/login" && req.method === "POST") {
      req.on("data", async (data) => {
        body = JSON.parse(data)
      })
      req.on("end", async () => {
        const result = await login(body)
        if (result) {
          res.end(JSON.stringify(result))
        } else {
          res.end("Wrong credentials")
        }
      })
    } else if (pathname === "/refresh-tokens" && req.method === "POST") {
      req.on("data", async (data) => {
        body = JSON.parse(data)
      })
      req.on("end", async () => {
        const tokens = await refreshTokens(body)
        res.end(JSON.stringify(tokens))
      })
    }
    return
  }

  res.writeHead(405)
  res.end(`${req.method} is not allowed for the request.`)
})

server.listen(port, () => {
  console.log("The server started on port 8080")
})
