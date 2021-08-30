const url = require("url")
const { pool } = require("../db/pool")

async function getItemById(req, res) {
  let idFromQueryString = url.parse(req.url, true).query.id
  try {
    let conn = await pool.getConnection()
    id = idFromQueryString
    sql = `SELECT text FROM todo WHERE id=?`
    let rows = await conn.query(sql, id, null)
    res.end(rows[0].text)
    conn.end()
  } catch (err) {
    res.statusCode = 404
    res.end(`There are no item with id=${idFromQueryString}`)
  }
}

async function AddItemToDB(body) {
  try {
    let conn = await pool.getConnection()
    const title = body.title
    const sql = `INSERT INTO todo (text) VALUES ?`
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
  AddItemToDB,
  editElement,
  deleteElement,
}
