const bcrypt = require("bcrypt")
require("dotenv").config()
const { pool } = require("../db/pool")

async function findUserByEmail(body) {
  try {
    let conn = await pool.getConnection()
    const email = body.email
    const sql = `SELECT * FROM users WHERE email=? LIMIT 1;`
    let [row] = await conn.query(sql, email, null)
    conn.end()
    return row
  } catch (error) {
    console.log("error", error)
    return false
  }
}

async function findUserByToken(token) {
  try {
    let conn = await pool.getConnection()
    const sql = `SELECT * FROM users WHERE token=? LIMIT 1;`
    let [row] = await conn.query(sql, token, null)
    conn.end()
    return row
  } catch (error) {
    console.log("error", error)
    return false
  }
}

async function findUserById(id) {
  try {
    let conn = await pool.getConnection()
    // const id = [body.id]
    const sql = `SELECT * FROM users WHERE userId=?`
    let [row] = await conn.query(sql, id, null)
    conn.end()
    return row
  } catch (error) {
    console.log("error", error)
    return false
  }
}

async function addUser(body) {
  const lifeTime = Number(process.env.REFRESH_TOKEN_LIFE_TIME)
  const salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS))
  const password = await bcrypt.hash(body.password, salt, null)
  try {
    const user = await findUserByEmail(body)
    if (user) {
      return false
    } else {
      let conn = await pool.getConnection()
      const user = [body.email, password, Date.now(), lifeTime]
      const sql = `INSERT INTO users (email,password,date,expiresIn) VALUES (?,?,?,?)`
      let row = await conn.query(sql, user, null)
      conn.end()
      return true
    }
  } catch (error) {
    console.log(error)
    return false
  }
}

module.exports = {
  findUserByEmail,
  findUserByToken,
  findUserById,
  addUser,
}
