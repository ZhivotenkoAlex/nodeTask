const http = require("http")
const url = require("url")
const mariadb = require("mariadb")

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "111",
  database: "nodeDB",
})

async function getItemById(req, res) {
  let idFromQueryString = url.parse(req.url, true).query.id
  try {
    let conn = await pool.getConnection()
    let rows = await conn.query(
      `SELECT text FROM todo WHERE id=${idFromQueryString}`
    )

    res.end(rows[0].text)
  } catch (err) {
    res.statusCode = 404
    res.end(`There are no item with id=${idFromQueryString}`)
  }
}

async function AddItemToDB(body) {
  try {
    let conn = await pool.getConnection()
    let rows = await conn.query(
      `INSERT INTO todo (text) VALUES ('${body.title}');`
    )
    res.end("It`s respond from get")
  } catch (error) {
    res.statusCode = 404
    res.end(`Something went wrong`)
  }
}

async function editElement(body) {
  try {
    let conn = await pool.getConnection()
    let rows = await conn.query(
      `UPDATE todo SET text='${body.title}' WHERE id=${body.id}`
    )
  } catch (error) {
    res.statusCode = 404
    res.end(`There are no item with id=${idFromQueryString}`)
  }
}

async function deleteElement(body) {
  try {
    let conn = await pool.getConnection()
    let rows = await conn.query(`DELETE FROM todo WHERE id=${body.id}`)
  } catch (error) {
    res.statusCode = 404
    res.end(`There are no item with id=${idFromQueryString}`)
  }
}

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  let body = null

  if (req.method === "GET") {
    getItemById(req, res)
  } else if (req.method === "POST") {
    req.on("data", (data) => {
      body = JSON.parse(data)
      AddItemToDB(body)
    })

    req.on("end", () => {
      res.end(`todo item '${body.title}' was added`)
    })
  } else if (req.method === "PUT") {
    req.on("data", (data) => {
      body = JSON.parse(data)
      editElement(body)
    })

    req.on("end", () => {
      res.end(`todo item with id='${body.id}' was modified`)
    })
  } else if (req.method === "DELETE") {
    req.on("data", (data) => {
      body = JSON.parse(data)
      deleteElement(body)
    })
    req.on("end", () => {
      res.end(`todo item with id='${body.id}' was deleted`)
    })
  }
})

server.listen(8080, () => {
  console.log("The server started on port 8080")
})
