const User = require("../model/userModel")
const url = require("url")
const { JsonWebTokenError } = require("jsonwebtoken")

async function getUser(req, res) {
  try {
    const item = url.parse(req.url, true).query.item
    const user = await User.findUser(item)
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

function createUser(req, res) {
  try {
    let body = ""
    req.on("data", (data) => {
      body += data.toString()
    })
    req.on("end", async () => {
      const { email, password } = JSON.parse(body)

      let user = await User.addUser(email, password)

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

function login(req, res) {
  try {
    let body = ""
    req.on("data", (data) => {
      body += data.toString()
    })
    req.on("end", async () => {
      const { email, password } = JSON.parse(body)
      const tokens = await User.login(email, password)
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

function refreshTokens(req, res) {
  try {
    let body = ""
    req.on("data", (data) => {
      body += data.toString()
    })
    req.on("end", async () => {
      const token = JSON.parse(body).refreshToken

      const tokens = await User.refreshTokens(token)
      console.log("==tokens RT==")
      console.log(tokens)
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

module.exports = {
  getUser,
  createUser,
  login,
  refreshTokens,
}
