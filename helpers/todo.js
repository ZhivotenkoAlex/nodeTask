const url = require("url")
const { pool } = require("../db/pool")
const jwt = require("jsonwebtoken")
const { findUserById } = require("./users")
require("dotenv").config()
const SECRET = process.env.SECRET

async function getItemById(req, res) {
  let idFromQueryString = url.parse(req.url, true).query.id
  try {
    let conn = await pool.getConnection()

    sql = `SELECT text FROM todo WHERE id=?`
    let rows = await conn.query(sql, idFromQueryString, null)
    res.end(JSON.stringify({ message: rows[0].text }))
    conn.end()
    return { message: rows[0].text }
  } catch (err) {
    res.statusCode = 404
    res.end(`There are no item with id=${idFromQueryString}`)
  }
}

async function getItems(req, res) {
  const token = url.parse(req.url, true).query.Authorization.split(" ")[1]
  const payload = jwt.verify(token, SECRET)
  user = await findUserById(payload.id)
  console.log("==GI user==")
  console.log(user)
  try {
    let conn = await pool.getConnection()
    sql = `SELECT * FROM todo WHERE userId=?`
    let rows = await conn.query(sql, user.userId, null)
    console.log("==1==")
    console.log(rows)
    let response = rows.map((item) => {
      return item
    })
    console.log("response")
    console.log(response)
    res.end(JSON.stringify(response))
    conn.end()
  } catch (error) {}
}

async function AddItemToDB(body) {
  try {
    let conn = await pool.getConnection()
    const token = body.token.split(" ")[1]
    const payload = jwt.verify(token, SECRET)
    const title = [body.title, payload.id]
    const sql = `INSERT INTO todo (text,userId) VALUES (?,?)`
    let rows = await conn.query(sql, title, null)
    conn.end()
  } catch (error) {
    console.log("error", error)
    return false
  }
}

async function editElement(body) {
  try {
    let conn = await pool.getConnection()
    const editInfo = [body.title, body.id]
    const sql = `UPDATE todo SET text=? WHERE id=?`
    let rows = await conn.query(sql, editInfo, null)
    conn.end()
  } catch (error) {
    // res.statusCode = 404
    // res.end(`There are no item with id=${idFromQueryString}`)
    console.log("error", error)
    return false
  }
}

async function setCheck(body) {
  try {
    let conn = await pool.getConnection()
    console.log("bbody.chekedody")
    console.log(body.checked)
    const editInfo = [body.checked, body.id]
    const sql = `UPDATE todo SET checked=? WHERE id=?`
    let rows = await conn.query(sql, editInfo, null)
    conn.end()
  } catch (error) {
    // res.statusCode = 404
    // res.end(`There are no item with id=${idFromQueryString}`)
    console.log("error", error)
    return false
  }
}

async function deleteElement(body) {
  try {
    let conn = await pool.getConnection()
    const id = body.id
    const sql = `DELETE FROM todo WHERE id=?`
    let rows = await conn.query(sql, id, null)
    conn.end()
  } catch (error) {
    res.statusCode = 404
    res.end(`There are no item with id=${idFromQueryString}`)
  }
}

module.exports = {
  getItemById,
  getItems,
  AddItemToDB,
  editElement,
  setCheck,
  deleteElement,
}
