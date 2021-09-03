const url = require("url")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const randomString = require("randomstring")
// const { v4: uuid } = require("uuid")
const { findUserByEmail, findUserByToken, findUserById } = require("./users")
const { pool } = require("../db/pool")
require("dotenv").config()

const SECRET = process.env.SECRET

async function isValidPassword(body) {
  const user = await findUserByEmail(body)
  return bcrypt.compare(body.password, user.password)
}

async function generateAccessToken(user) {
  // const user = await findUserByEmail(body)
  const payload = { type: "access", id: user.userId }
  const token = jwt.sign(payload, SECRET, { expiresIn: "10h" })
  return token
}

async function generateRefreshToken() {
  const salt = await bcrypt.genSalt(10)
  const token = await bcrypt.hash(randomString.generate(32), salt, null)
  return token
}

async function updateDbRefreshToken(refreshToken, user) {
  let conn = await pool.getConnection()
  try {
    const editInfo = [refreshToken, Date.now(), user.userId]
    const sql = `UPDATE users SET token=?,date=? WHERE userId=?`
    let rows = await conn.query(sql, editInfo, null)
    conn.end()
  } catch (error) {
    console.log(error)
  }
}

async function updateTokens(user) {
  const accessToken = await generateAccessToken(user)
  const refreshToken = await generateRefreshToken()
  await updateDbRefreshToken(refreshToken, user)
  return {
    accessToken,
    refreshToken,
  }
}

async function login(body) {
  try {
    const isValid = await isValidPassword(body)
    if (isValid) {
      const user = await findUserByEmail(body)
      const tokens = await updateTokens(user)
      return tokens
    }
  } catch (error) {
    return false
  }
}

async function refreshTokens(body) {
  const refreshToken = body.refreshToken
  const user = await findUserByToken(refreshToken)
  try {
    if (user) {
      return updateTokens(user)
    } else {
      return "tokenError"
    }
  } catch (error) {
    console.log(error)
    return "token error"
  }
}

async function verifyAccess(req, res, body = null) {
  try {
    const auth = url.parse(req.url, true).query.Authorization
    let token = null

    if (body.token) {
      token = body.token.split(" ")[1]
    } else if (auth) {
      token = auth.split(" ")[1]
    }
    const payload = jwt.verify(token, SECRET)
    const user = await findUserById(payload.id)

    if (payload.type !== "access") {
      res.statusCode = 401
      res.end("invalid token")
      return false
    }

    if (user.date + user.expiresIn < Date.now()) {
      res.statusCode = 401
      res.end("token expired")
      return false
    }
    if (user) {
      return true
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.statusCode = 401
      res.end("error token")
    }
  }
  return true
}

module.exports = {
  isValidPassword,
  generateAccessToken,
  generateRefreshToken,
  updateDbRefreshToken,
  updateTokens,
  login,
  refreshTokens,
  verifyAccess,
}
