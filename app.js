const http = require("http")
const url = require("url")

const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const {
  getItemById,
  AddItemToDB,
  editElement,
  deleteElement,
} = require("./helpers/todo")
const { addUser } = require("./helpers/users")
const { login, refreshTokens, verifyAccess } = require("./helpers/auth")

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  let body = null
  let pathname = url.parse(req.url, true).pathname

  // switch (pathname && req.method) {
  //   case "/api/todo" && "GET":
  //     req.on("data", async (data) => {
  //       body = JSON.parse(data)
  //     })
  //     req.on("end", async () => {
  //       const result = await verifyAccess(req, res)
  //       if (result) {
  //         getItemById(req, res)
  //       } else {
  //         res.statusCode = 401
  //         res.end("token error")
  //       }
  //     })
  //     break

  //   case "/api/todo" && "POST":
  //     req.on("data", async (data) => {
  //       body = JSON.parse(data)
  //       const result = await verifyAccess(req, res)
  //       if (result) {
  //         AddItemToDB(body)
  //       } else {
  //         res.statusCode = 401
  //         res.end("token error")
  //       }
  //     })
  //     req.on("end", () => {
  //       res.end(`todo item '${body.title}' was added`)
  //     })
  //     break

  //   case "/api/todo" && "PUT":
  //     req.on("data", async (data) => {
  //       body = JSON.parse(data)
  //       const result = await verifyAccess(req, res)
  //       if (result) {
  //         editElement(body)
  //       } else {
  //         res.statusCode = 401
  //         res.end("token error")
  //       }
  //     })
  //     req.on("end", () => {
  //       res.end(`todo item with id='${body.id}' was modified`)
  //     })
  //     break

  //   case "/api/todo" && "DELETE":
  //     req.on("data", async (data) => {
  //       body = JSON.parse(data)
  //       const result = await verifyAccess(req, res)
  //       if (result) {
  //         deleteElement(body)
  //       } else {
  //         res.statusCode = 401
  //         res.end("token error")
  //       }
  //     })
  //     req.on("end", () => {
  //       res.end(`todo item with id='${body.id}' was deleted`)
  //     })
  //     break

  //   case "/auth" && "POST":
  //     req.on("data", async (data) => {
  //       body = JSON.parse(data)
  //     })
  //     req.on("end", async () => {
  //       const result = await addUser(body)
  //       if (result) {
  //         res.end("user alredy exist")
  //       } else {
  //         res.end(`user was added`)
  //       }
  //     })
  //     break

  //   case "/login" && "POST":
  //     req.on("data", async (data) => {
  //       body = JSON.parse(data)
  //     })
  //     req.on("end", async () => {
  //       const result = await login(body)
  //       if (result) {
  //         res.end(JSON.stringify(result))
  //       } else {
  //         res.end("Wrong credentials")
  //       }
  //     })
  //     break

  //   case "/refresh-tokens" && "POST":
  //     req.on("data", async (data) => {
  //       body = JSON.parse(data)
  //     })
  //     req.on("end", async () => {
  //       const tokens = await refreshTokens(body)
  //       res.end(JSON.stringify(tokens))
  //     })
  //     break

  //   default:
  //     break
  // }

  if (pathname === "/api/todo" && req.method === "GET") {
    req.on("data", async (data) => {
      body = JSON.parse(data)
    })
    req.on("end", async () => {
      const result = await verifyAccess(req, res)
      if (result) {
        getItemById(req, res)
      } else {
        res.statusCode = 401
        res.end("token error")
      }
    })
  } else if (pathname === "/api/todo" && req.method === "POST") {
    req.on("data", async (data) => {
      body = JSON.parse(data)
      const result = await verifyAccess(req, res)
      if (result) {
        AddItemToDB(body)
      } else {
        res.statusCode = 401
        res.end("token error")
      }
    })

    req.on("end", () => {
      res.end(`todo item '${body.title}' was added`)
    })
  } else if (pathname === "/api/todo" && req.method === "PUT") {
    req.on("data", async (data) => {
      body = JSON.parse(data)
      const result = await verifyAccess(req, res)
      if (result) {
        editElement(body)
      } else {
        res.statusCode = 401
        res.end("token error")
      }
    })
    req.on("end", () => {
      res.end(`todo item with id='${body.id}' was modified`)
    })
  } else if (pathname === "/api/todo" && req.method === "DELETE") {
    req.on("data", async (data) => {
      body = JSON.parse(data)
      const result = await verifyAccess(req, res)
      if (result) {
        deleteElement(body)
      } else {
        res.statusCode = 401
        res.end("token error")
      }
    })
    req.on("end", () => {
      res.end(`todo item with id='${body.id}' was deleted`)
    })
  } else if (pathname === "/auth" && req.method === "POST") {
    req.on("data", async (data) => {
      body = JSON.parse(data)
    })
    req.on("end", async () => {
      const result = await addUser(body)
      if (result) {
        res.end("user alredy exist")
      } else {
        res.end(`user was added`)
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
})

server.listen(8080, () => {
  console.log("The server started on port 8080")
})
