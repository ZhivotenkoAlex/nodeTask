const url = require("url")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { v4: uuid } = require("uuid")
const { findUserByEmail } = require("./users")
const { pool } = require("../db/pool")
require("dotenv").config()

const SECRET = process.env.SECRET

async function isValidPassword(body) {
  const user = await findUserByEmail(body)
  return bcrypt.compare(body.password, user.password)
}

async function generateAccessToken(body) {
  const user = await findUserByEmail(body)
  const payload = { type: "access", id: user.id }
  const token = jwt.sign(payload, SECRET, { expiresIn: "4m" })
  return token
}

async function generateRefreshToken() {
  const payload = { id: uuid(), type: "refresh" }

  const token = jwt.sign(payload, SECRET, { expiresIn: "10m" })
  return token
}

async function updateDbRefreshToken(refreshToken, body) {
  let conn = await pool.getConnection()
  const user = await findUserByEmail(body)
  try {
    const editInfo = [refreshToken, user.userId]
    const sql = `UPDATE users SET token=? WHERE userId=?`
    let rows = await conn.query(sql, editInfo, null)
    conn.end()
  } catch (error) {
    console.log(error)
  }
}

async function updateTokens(body) {
  const accessToken = await generateAccessToken(body)
  const refreshToken = await generateRefreshToken()

  await updateDbRefreshToken(refreshToken, body)
  return {
    accessToken,
    refreshToken,
  }
}

async function login(body) {
  try {
    const isValid = await isValidPassword(body)
    if (isValid) {
      const tokens = await updateTokens(body)
      return tokens
    }
  } catch (error) {
    return false
  }
}

async function refreshTokens(body) {
  const refreshToken = body.refreshToken
  let payload
  try {
    payload = jwt.verify(refreshToken, SECRET)
    if (payload.type !== "refresh") {
      return false
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return "token expired"

      return tokens
    } else if (error instanceof jwt.JsonWebTokenError) {
      return "token error"
    }
  }

  return updateTokens(body)
}

async function verifyAccess(req, res) {
  try {
    const auth = url.parse(req.url, true).query.Authorization
    const token = auth.split(" ")[1]
    const payload = jwt.verify(token, SECRET)
    if (payload.type !== "access") {
      res.statusCode = 401
      res.end("invalid token")
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.statusCode = 401
      res.end("token expired")
    } else if (error instanceof jwt.JsonWebTokenError) {
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
