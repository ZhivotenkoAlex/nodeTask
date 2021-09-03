const url = require("url")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const randomString = require("randomstring")
const User = require("../controller/userController")
const { pool } = require("../db/pool")
require("dotenv").config()
const SECRET = process.env.SECRET
const REFRESH_TOKEN_LIFE_TIME = process.env.REFRESH_TOKEN_LIFE_TIME

async function isValidPassword(email, password) {
  try {
    const user = await User.getUser(email)
    isValid = bcrypt.compare(password, password)
    if (!isValid) {
      return new Error("Invalid credentials")
    }
    return user
  } catch (error) {
    console.log(error)
  }
}

async function generateAccessToken(user) {
  try {
    const payload = {
      type: "access",
      id: user.userId,
      lifetime: toString(REFRESH_TOKEN_LIFE_TIME + Date.now()),
    }
    const token = jwt.sign(payload, SECRET, { expiresIn: "10h" })
    return token
  } catch (error) {
    console.log(error)
  }
}

async function generateRefreshToken() {
  try {
    const salt = bcrypt.genSalt(10)
    const token = bcrypt.hash(randomString.generate(32), salt, null)
    return token
  } catch (error) {
    console.log(error)
  }
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
  try {
    const accessToken = await generateAccessToken(user)
    const refreshToken = await generateRefreshToken()
    await updateDbRefreshToken(refreshToken, user)
    return {
      accessToken,
      refreshToken,
    }
  } catch (error) {
    console.log(error)
  }
}

async function login(email, password) {
  try {
    const user = await isValidPassword(email, password)
    if (user) {
      const tokens = await updateTokens(user)
      return tokens
    }
    return new Error("Wrong credentials")
  } catch (error) {
    console.log(error)
  }
}

async function refreshTokens(refreshToken) {
  try {
    const user = await User.getUser(refreshToken)
    if (user) {
      return updateTokens(user)
    } else {
      return new Error("Invalid Token")
    }
  } catch (error) {
    console.log(error)
  }
}

async function verifyAccess(accessToken) {
  try {
    const token = accessToken.split
    const payload = jwt.verify(token, SECRET)
    const user = null
    if (payload.type !== "access") {
      return new Error("Invalid token")
    } else if (payload.lifetime < Date.now()) {
      return new Error("Token expired")
    } else user = await User.getUser(payload.id)
    if (user) {
      return true
    } else {
      return new Error("Invalid token")
    }
  } catch (error) {
    console.log(error)
  }
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
