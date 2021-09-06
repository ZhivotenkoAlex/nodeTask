const http = require("http")
const url = require("url")
const querystring = require("querystring")

const {
  getUser,
  login,
  createUser,
  refreshTokens,
} = require("./controller/userController")
const {
  getItemById,
  getItems,
  addItem,
  editItem,
  setCheck,
  deleteItem,
} = require("./controller/todoController")
const jwt = require("jsonwebtoken")
const port = 8080

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Content-Type", "application/json")
  res.setHeader("Access-Control-Allow-Credentials", "true")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "*")

  if (req.method === "OPTIONS") {
    res.writeHead(204)
    res.end()
    return
  }

  if (["GET", "POST", "PATCH", "DELETE"].indexOf(req.method) > -1) {
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

    //Todo paths
    if (pathname === "/api/todo" && req.method === "GET") {
      getItems(req, res)
    } else if (pathname === "/api/todo/id" && req.method === "GET") {
      getItemById(req, res)
    } else if (pathname === "/api/todo" && req.method === "POST") {
      addItem(req, res)
    } else if (pathname === "/api/todo/title" && req.method === "PATCH") {
      editItem(req, res)
    } else if (pathname === "/api/todo/check" && req.method === "PATCH") {
      setCheck(req, res)
    } else if (pathname === "/api/todo" && req.method === "DELETE") {
      deleteItem(req, res)
    }
    return
  }

  res.writeHead(405)
  res.end(
    JSON.stringify({ error: `${req.method} is not allowed for the request.` })
  )
})

server.listen(port, () => {
  console.log("The server started on port 8080")
})
