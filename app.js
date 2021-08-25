const http = require("http")
const mariadb = require("mariadb")

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "111",
  database: "nodeDB",
})

async function AddItemToDB(body) {
  try {
    let conn = await pool.getConnection()
    let rows = await conn.query(
      `INSERT INTO todo (text) VALUES ('${body.title}');`
    )
    res.end("It`s respond from get")
    console.log("OK")
  } catch (error) {}
}

async function getFirstElement(res) {
  try {
    let conn = await pool.getConnection()
    let rows = await conn.query("SELECT text FROM todo WHERE id=1")
    console.log(rows[0].text)
    res.end(rows[0].text)
  } catch (err) {
    throw err
  }
}

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  if (req.method === "GET") {
    getFirstElement(res)
  } else if (req.method === "POST") {
    let body = null
    req.on("data", (data) => {
      body = JSON.parse(data)
      AddItemToDB(body)
    })

    req.on("end", () => {
      res.end(`todo item '${body.title}' was   added`)
    })
  }
})

server.listen(8080, () => {
  console.log("The server started on port 8080")
})
