const url = require("url")
const { pool } = require("../db/pool")
const jwt = require("jsonwebtoken")
// const { findUserById } = require("./users")
require("dotenv").config()
const SECRET = process.env.SECRET

async function createItem(title, token) {
  try {
    let conn = await pool.getConnection()
    const payload = jwt.verify(token, SECRET)
    const item = [title, payload.id]
    const sql = `INSERT INTO todo (text,userId) VALUES (?,?)`
    let rows = await conn.query(sql, item, null)
    conn.end()
  } catch (error) {
    console.log("error", error.message)
  }
}

async function getItems(accessToken) {
  try {
    const payload = jwt.verify(accessToken, SECRET).id

    console.log("==payload==")
    console.log(payload)
    if (error instanceof jwt.JsonWebTokenError) {
    }
    let conn = await pool.getConnection()
    sql = `SELECT * FROM todo WHERE userId=?`
    let rows = await conn.query(sql, payload.id, null)
    let response = rows.map((item) => {
      return item
    })
    return response
  } catch (error) {
    console.log(error)
  }
}
module.exports = {
  createItem,
  getItems,
}
