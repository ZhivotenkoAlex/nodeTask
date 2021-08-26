const http = require("http")
const url = require("url")
const mariadb = require("mariadb")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

const saltRounds = 10

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
    const sql = `INSERT INTO todo (text) VALUES (?);`
    let rows = await conn.query(sql, title, null)
    res.end("It`s respond from get")
    conn.end()
  } catch (error) {
    res.statusCode = 404
    res.end(`Something went wrong`)
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
    res.statusCode = 404
    res.end(`There are no item with id=${idFromQueryString}`)
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

async function findUserByEmail(body) {
  try {
    let conn = await pool.getConnection()
    const email = body.email
    const sql = `SELECT * FROM users WHERE email=? LIMIT 1`
    let [row] = await conn.query(sql, email, null)
    conn.end()
    return row
  } catch (error) {
    console.log("error", error)
    return false
  }
}

async function findUserById(body) {
  try {
    let conn = await pool.getConnection()
    const id = body.id
    const sql = `SELECT * FROM users WHERE id=?`
    let [row] = await conn.query(sql, id, null)
    conn.end()
    return row
  } catch (error) {
    res.statusCode = 404
    res.end(`No users was found`)
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

async function isValidPassword(body) {
  const user = await findUserByEmail(body)
  return bcrypt.compare(body.password, user.password)
}
async function updateToken(is, token) {
  let conn = await pool.getConnection()
}

async function login(body) {
  try {
    const isValid = await isValidPassword(body)
    if (isValid) {
      const user = await findUserByEmail(body)
      const payload = { id: user.userId }
      const SECRET = "trololo"
      const token = jwt.sign(payload, SECRET, { expiresIn: "2h" })
      return { token }
    }
  } catch (error) {
    return false
  }
}

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  let body = null
  let pathname = url.parse(req.url, true).pathname

  switch (pathname && req.method) {
    case "/api/todo" && "GET":
      getItemById(req, res)
      break

    case "/api/todo" && "POST":
      req.on("data", (data) => {
        body = JSON.parse(data)
        AddItemToDB(body)
      })
      req.on("end", () => {
        res.end(`todo item '${body.title}' was added`)
      })
      break

    case "/api/todo" && "PUT":
      req.on("data", (data) => {
        body = JSON.parse(data)
        editElement(body)
      })
      req.on("end", () => {
        res.end(`todo item with id='${body.id}' was modified`)
      })
      break

    case "/api/todo" && "DELETE":
      req.on("data", (data) => {
        body = JSON.parse(data)
        deleteElement(body)
      })
      req.on("end", () => {
        res.end(`todo item with id='${body.id}' was deleted`)
      })
      break

    case "/auth" && "POST":
      req.on("data", async (data) => {
        body = JSON.parse(data)
      })
      req.on("end", async () => {
        const result = await addUser(body)
        console.log(result)
        if (result) {
          res.end(`user was added`)
        } else {
          res.end("user alredy exist")
        }
      })
      break

    case "/login" && "POST":
      req.on("data", async (data) => {
        body = JSON.parse(data)
      })
      req.on("end", async () => {
        const result = await login(body)
        console.log("==1==")
        console.log("result", result)
        if (result) {
          res.end(JSON.stringify(result))
        } else {
          res.end("Wrong credentials")
        }
      })
      break

    default:
      break
  }

  // if (pathname === "/api/todo" && req.method === "GET") {
  //   getItemById(req, res)
  // } else
  // if (pathname === "/api/todo" && req.method === "POST") {
  //   req.on("data", (data) => {
  //     body = JSON.parse(data)
  //     AddItemToDB(body)
  //   })

  //   req.on("end", () => {
  //     res.end(`todo item '${body.title}' was added`)
  //   })
  // } else
  // if (pathname === "/api/todo" && req.method === "PUT") {
  //   req.on("data", (data) => {
  //     body = JSON.parse(data)
  //     editElement(body)
  //   })
  //   req.on("end", () => {
  //     res.end(`todo item with id='${body.id}' was modified`)
  //   })
  // } else if (pathname === "/api/todo" && req.method === "DELETE") {
  //   req.on("data", (data) => {
  //     body = JSON.parse(data)
  //     deleteElement(body)
  //   })
  //   req.on("end", () => {
  //     res.end(`todo item with id='${body.id}' was deleted`)
  //   })
  // } else if (pathname === "/auth" && req.method === "POST") {
  //   req.on("data", async (data) => {
  //     body = JSON.parse(data)
  //   })
  //   req.on("end", async () => {
  //     const result = await addUser(body)
  //     if (result) {
  //       res.end(`user was added`)
  //     } else {
  //       res.end("user alredy exist")
  //     }
  //   })
  // } else if (pathname === "/login" && req.method === "POST") {
  //   req.on("data", async (data) => {
  //     body = JSON.parse(data)
  //   })
  //   req.on("end", async () => {
  //     const result = await login(body)
  //     console.log("==1==")
  //     console.log("result", result)
  //     if (result) {
  //       res.end(JSON.stringify(result))
  //     } else {
  //       res.end("Wrong credentials")
  //     }
  //   })
  // }
})

server.listen(8080, () => {
  console.log("The server started on port 8080")
})
