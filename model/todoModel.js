const url = require("url")
const { pool } = require("../db/pool")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const SECRET = process.env.SECRET
const REFRESH_TOKEN_LIFE_TIME = process.env.REFRESH_TOKEN_LIFE_TIME

async function getItemById(id) {
  try {
    let conn = await pool.getConnection()
    sql = `SELECT * FROM todo WHERE id=?`
    let [row] = await conn.query(sql, [id], null)
    conn.end()
    return row
  } catch (err) {
    res.statusCode = 404
    res.end(`There are no item with id=${id}`)
  }
}

async function createItem(title, accessToken) {
  try {
    let conn = await pool.getConnection()
    const payload = jwt.verify(accessToken.split(" ")[1], SECRET)
    if (payload instanceof Error) {
      return new Error("Invalid token")
    }
    const item = [title, payload.id]
    const sql = `INSERT INTO todo (text,userId) VALUES (?,?)`
    let rows = await conn.query(sql, item, null)
    conn.end()
  } catch (error) {
    console.log("error1", error.message)
  }
}

async function getItems(accessToken) {
  try {
    const userId = jwt.verify(accessToken, SECRET).id
    if (userId instanceof Error) {
      return new Error("Invalid token")
    }

    let conn = await pool.getConnection()
    sql = `SELECT * FROM todo WHERE userId=?`
    let rows = await conn.query(sql, [userId], null)
    let response = rows.map((item) => {
      return item
    })
    return response
  } catch (error) {
    console.log(error)
  }
}

async function editElement(title, id) {
  try {
    let conn = await pool.getConnection()
    const editInfo = [title, id]
    const sql = `UPDATE todo SET text=? WHERE id=?`
    let rows = await conn.query(sql, editInfo, null)
    if (rows.affectedRows === 0) {
      return new Error("Wrong id")
    }
    conn.end()
  } catch (error) {
    console.log("error", error)
  }
}

async function setCheck(checked, id) {
  try {
    let conn = await pool.getConnection()
    const editInfo = [checked, id]
    const sql = `UPDATE todo SET checked=? WHERE id=?`
    let rows = await conn.query(sql, editInfo, null)
    if (rows.affectedRows === 0) {
      return new Error("Wrong id")
    }
    conn.end()
  } catch (error) {
    console.log("error", error)
  }
}

async function deleteElement(id) {
  try {
    let conn = await pool.getConnection()
    const sql = `DELETE FROM todo WHERE id=?`
    let rows = await conn.query(sql, id, null)
    if (rows.affectedRows === 0) {
      return new Error("Wrong id")
    }
    conn.end()
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  createItem,
  getItemById,
  getItems,
  editElement,
  setCheck,
  deleteElement,
}
