const http = require("http")
const url = require("url")
const querystring = require("querystring")

// const bcrypt = require("bcrypt")
// const jwt = require("jsonwebtoken")

// const {
//   getItemById,
//   getItems,
//   AddItemToDB,
//   editElement,
//   setCheck,
//   deleteElement,
// } = require("./helpers/todo")
// const { addUser, findUserByEmail, getUser } = require("./helpers/users")
// const { login, refreshTokens, verifyAccess } = require("./helpers/auth")

const {
  getUser,
  login,
  createUser,
  refreshTokens,
} = require("./controller/userController")
const { getItems } = require("./controller/todoController")
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
    //Users paths
    if (pathname === "/api/user" && req.method === "GET") {
      getUser(req, res)
    } else if (pathname === "/api/user" && req.method === "POST") {
      createUser(req, res)
    } else if (pathname === "/api/auth/login" && req.method === "POST") {
      login(req, res)
    } else if (
      pathname === "/api/auth/refresh_tokens" &&
      req.method === "POST"
    ) {
      refreshTokens(req, res)
    }

    //todo paths

    if (pathname === "/api/todo" && req.method === "GET") {
      getItems(req, res)
    }
    // if (pathname === "/api/todo" && req.method === "GET") {
    //   req.on("data", async (data) => {
    //     body = JSON.parse(data)
    //   })
    //   req.on("end", async () => {
    //     const result = await verifyAccess(req, res)
    //     if (result) {
    //       await getItemById(req, res)
    //     } else {
    //       res.statusCode = 401
    //       res.end("token error")
    //     }
    //   })
    // } else if (pathname === "/api/todos" && req.method === "GET") {
    //   req.on("data", async (data) => {
    //     body = JSON.parse(data)
    //   })
    //   req.on("end", async () => {
    //     const result = await verifyAccess(req, res)
    //     if (result) {
    //       await getItems(req, res)
    //     } else {
    //       res.statusCode = 401
    //       res.end("token error")
    //     }
    //   })
    // } else if (pathname === "/user" && req.method === "GET") {
    //   req.on("data", async (data) => {
    //     body = JSON.parse(data)
    //   })
    //   req.on("end", async () => {
    //     const user = await getUser(req, res)
    //     if (user) {
    //       res.end(JSON.stringify(user))
    //     } else {
    //       res.statusCode = 401
    //       res.end("user not found")
    //     }
    //   })
    // } else if (pathname === "/api/todo" && req.method === "POST") {
    //   req.on("data", async (data) => {
    //     body = JSON.parse(data)
    //   })
    //   req.on("end", async () => {
    //     const result = await verifyAccess(req, res, body)
    //     if (result) {
    //       AddItemToDB(body)
    //       res.end({ status: `todo item was added` })
    //     } else {
    //       res.statusCode = 401
    //       res.end({ error: "verify error" })
    //     }
    //   })
    // } else if (pathname === "/api/todo" && req.method === "PUT") {
    //   req.on("data", async (data) => {
    //     body = JSON.parse(data)
    //   })
    //   req.on("end", async () => {
    //     const result = await verifyAccess(req, res, body)
    //     if (result) {
    //       editElement(body)
    //       res.end({ status: `todo item with id='${body.id}' was modified` })
    //     } else {
    //       res.statusCode = 401
    //       res.end("token error")
    //     }
    //   })
    // } else if (pathname === "/api/todo/check" && req.method === "PUT") {
    //   req.on("data", async (data) => {
    //     body = JSON.parse(data)
    //   })
    //   req.on("end", async () => {
    //     try {
    //       const result = await verifyAccess(req, res, body)
    //       if (result) {
    //         setCheck(body)
    //         res.statusCode = "200"
    //         return `todo item with id='${body.id}' was modified`
    //       }
    //     } catch (error) {
    //       res.statusCode = "401"
    //       res.end("token error")
    //     }
    //   })
    // } else if (pathname === "/api/todo" && req.method === "DELETE") {
    //   req.on("data", async (data) => {
    //     body = JSON.parse(data)
    //   })
    //   req.on("end", async () => {
    //     try {
    //       const result = await verifyAccess(req, res, body)
    //       if (result) {
    //         deleteElement(body)
    //         res.statusCode = 200
    //         res.end({ status: `todo item with id='${body.id}' was deleted` })
    //       }
    //     } catch (e) {
    //       res.statusCode = 401
    //       res.end("token error")
    //       console.log(e)
    //     }
    //   })
    // } else if (pathname === "/auth" && req.method === "POST") {
    //   req.on("data", async (data) => {
    //     body = JSON.parse(data)
    //   })
    //   req.on("end", async () => {
    //     const result = await addUser(body)
    //     if (result) {
    //       res.end({ status: "user was added" })
    //     } else {
    //       res.end({ error: `user alredy exist` })
    //     }
    //   })
    // } else if (pathname === "/login" && req.method === "POST") {
    //   req.on("data", async (data) => {
    //     body = JSON.parse(data)
    //   })
    //   req.on("end", async () => {
    //     const result = await login(body)
    //     if (result) {
    //       res.end(JSON.stringify(result))
    //     } else {
    //       res.end({ error: "Wrong credentials" })
    //     }
    //   })
    // } else if (pathname === "/refresh-tokens" && req.method === "POST") {
    //   req.on("data", async (data) => {
    //     body = JSON.parse(data)
    //   })
    //   req.on("end", async () => {
    //     const tokens = await refreshTokens(body)
    //     res.end(JSON.stringify(tokens))
    //   })
    // }
    return
  }

  res.writeHead(405)
  res.end({ error: `${req.method} is not allowed for the request.` })
})

server.listen(port, () => {
  console.log("The server started on port 8080")
})
