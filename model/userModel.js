const bcrypt = require("bcrypt")
require("dotenv").config()
const url = require("url")
const { pool } = require("../db/pool")
const jwt = require("jsonwebtoken")
const randomString = require("randomstring")
const SECRET = process.env.SECRET
const REFRESH_TOKEN_LIFE_TIME = process.env.REFRESH_TOKEN_LIFE_TIME

// allows to search by Email,ID or Token
async function findUser(query) {
  try {
    let conn = await pool.getConnection()
    const sql =
      "SELECT * FROM nodeDB.users WHERE userId=? OR email=? OR token=?"
    let [row] = await conn.query(sql, [query, query, query], null)
    conn.end()
    if (!row) {
      return new Error("User does not exist")
    }
    return row
  } catch (error) {
    console.log("error", error)
  }
}

async function validateEmail(email) {
  const reg =
    /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  return reg.test(String(email).toLowerCase())
}

async function addUser(email, password) {
  try {
    const user = await findUser(email)
    const lifeTime = Number(process.env.REFRESH_TOKEN_LIFE_TIME)
    const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS))
    const hashPassword = await bcrypt.hash(password, salt, null)

    if ((await validateEmail(email)) === false) {
      return new Error(`Email ${email} is invalid`)
    } else if (password.length < 6) {
      return new Error(
        `Password length must be at least 6 characters(you are currently using ${password.length} characters`
      )
    } else if (user) {
      return new Error("User already exist")
    } else {
      let conn = await pool.getConnection()
      const user = [email, hashPassword, Date.now(), lifeTime]
      const sql = `INSERT INTO users (email,password,date,expiresIn) VALUES (?,?,?,?)`
      await conn.query(sql, user, null)
      conn.end()
    }
  } catch (error) {
    console.log(error)
  }
}

async function isValidPassword(email, password) {
  try {
    const user = await findUser(email)
    if (user instanceof Error) {
      return new Error("User does not exist")
    }
    const isValid = await bcrypt.compare(password, user.password)
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
    const salt = await bcrypt.genSalt(10)
    const token = bcrypt.hash(randomString.generate(32), salt, null)
    return token
  } catch (error) {
    console.log(error)
  }
}

async function updateDbRefreshToken(refreshToken, user) {
  let conn = await pool.getConnection()
  try {
    if (user instanceof Error) {
      return new Error("User does not exist")
    }
    const editInfo = [refreshToken, Date.now(), user.userId]
    const sql = `UPDATE users SET token=?,date=? WHERE userId=?`
    let rows = await conn.query(sql, editInfo, null)
    console.log(rows)
    conn.end()
  } catch (error) {
    console.log(error)
  }
}

async function updateTokens(user) {
  try {
    if (user instanceof Error) {
      return new Error("User does not exist")
    }
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
    const isEmailValid = await validateEmail(email)
    if (user instanceof Error || isEmailValid === false) {
      return new Error("Wrong credentials")
    }
    const tokens = await updateTokens(user)
    return tokens
  } catch (error) {
    console.log(error)
  }
}

async function refreshTokens(refreshToken) {
  try {
    const user = await findUser(refreshToken)
    if (user instanceof Error) {
      new Error("Invalid Token")
    }
    return await updateTokens(user)
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
    } else user = await findUser(payload.id)
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
  findUser,
  addUser,
}
