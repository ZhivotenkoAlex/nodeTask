const bcrypt = require("bcrypt")
require("dotenv").config()
const { pool } = require("../db/pool")

const salt = process.env.salt

async function findUserByEmail(body) {
  try {
    let conn = await pool.getConnection()
    const email = body.email
    const sql = `SELECT * FROM users WHERE email=? LIMIT 1;`
    let [row] = await conn.query(sql, email, null)
    // conn.end()
    return row
  } catch (error) {
    console.log("error", error)
    return false
  }
}

async function findUserById(body) {
  try {
    let conn = await pool.getConnection()
    const id = [body.id]
    const sql = `SELECT * FROM users WHERE id=?`
    let [row] = await conn.query(sql, id, null)
    // conn.end()
    return row
  } catch (error) {
    console.log("error", error)
    return false
  }
}

async function addUser(body) {
  const salt = await bcrypt.genSalt(saltRounds)
  const password = await bcrypt.hash(body.password, salt, null)
  try {
    const user = await findUserByEmail(body)
    if (user) {
      return false
    } else {
      let conn = await pool.getConnection()
      const user = [body.email, password]
      const sql = `INSERT INTO users (email,password) VALUES (?,?)`
      let row = await conn.query(sql, user, null)
      conn.end()
      return true
    }
  } catch (error) {
    return false
  }
}

module.exports = {
  findUserByEmail,
  findUserById,
  addUser,
}
