const url = require("url")
const jwt = require("jsonwebtoken")
const { findUser } = require("../model/userModel")
const { pool } = require("../db/pool")
require("dotenv").config()
const SECRET = process.env.SECRET

async function verifyAccess(req, res, token) {
  try {
    const payload = jwt.verify(token, SECRET)
    const user = await findUser(payload.id)

    if (!payload) {
      return new Error("invalid token")
    }

    if (payload.type !== "access") {
      return new Error("invalid token")
    }

    if (user.date + user.expiresIn < Date.now()) {
      return new Error("token expired")
    }
    if (user) {
      return true
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return new Error("error token")
    }
    return new Error("error token")
  }
  return true
}

module.exports = {
  verifyAccess,
}
