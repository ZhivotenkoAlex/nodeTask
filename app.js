const http = require("http")
const url = require("url")
const mariadb = require("mariadb")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { v4: uuid } = require('uuid')

const saltRounds = 10
const SECRET = "trololo"

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
    const id = body.id
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

async function isValidPassword(body) {
  const user = await findUserByEmail(body)
  return bcrypt.compare(body.password, user.password)
}



async function generateAccessToken(body){
  const user = await findUserByEmail(body)
  const payload = { type: "access", id: user.id }
  const token = jwt.sign(payload, SECRET, { expiresIn: "2m" })
  return token
}

async function generateRefreshToken() {
  const payload = { id: uuid(), type: 'refresh' }

  const token = jwt.sign(payload, SECRET, { expiresIn: "4m" })
  return 
   token
  
}

async function updateDbRefreshToken(refreshToken, body) {
  try {
    let conn = await pool.getConnection()
    const user = await findUserById(body)
    // const refreshToken=generateRefreshToken()
    const editInfo = [refreshToken, user.id]
    const sql = `UPDATE users SET token=? WHERE id=?`
    let rows = await conn.query(sql, editInfo, null)
    conn.end()
  } catch (error) {
    console.log(error);
  }
}

async function updateTokens(body) {
  const accessToken = await generateAccessToken(body)

    const refreshToken =await generateRefreshToken()

  await updateDbRefreshToken(refreshToken, body)
  return {
    accessToken,
    refreshToken:token
  }
}

async function login(body) {
  try {
    const isValid = await isValidPassword(body)
    if (isValid) {
      // const user = await findUserByEmail(body)
      // const payload = { id: user.id }
      const tokens = await updateTokens(body)
      return  tokens 
    }
  } catch (error) {
    return false
  }
}

async function refreshTokens(body) {
  const refreshToken = body.refreshToken
  let payload
  try {
    payload = jwt.verify(refreshToken, SECRET)
    if (payload.type !== 'refresh') {
      return false
    }
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return 'token expired'
    } else if (error instanceof jwt.JsonWebTokenError) {
      return 'token error'
    }
  }

  updateTokens(body)
}

async function verifyAccess(req,res) {
  const auth = url.parse(req.url, true).query.Authorization
  const token = auth.split(' ')[1]
  try {
    const payload=jwt.verify(token, SECRET)
    if (payload.type !== 'access') {
      res.statusCode(401)
      res.end("invalid token")
        return token
    }
        
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.statusCode(401)
      res.end("token expired")
    
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.statusCode(401)
      res.end("invalid token")
      }
     }     
}  

const server = http.createServer((req, res) => {
  res.statusCode = 200
  res.setHeader("Content-Type", "application/json")
  let body = null
  let pathname = url.parse(req.url, true).pathname

   if (pathname === "/api/todo" && req.method === "GET") {
   req.on("data", async (data) => {
      body = JSON.parse(data)
    })
     req.on('end', async () => {
       const result = await verifyAccess(req, res)
       if (result) {
         getItemById(req,res)
       } else {
         res.statusCode(401)
         res.end("token error")
 }
   })
    
  } else
  if (pathname === "/api/todo" && req.method === "POST") {
    req.on("data", async (data) => {
      body = JSON.parse(data)
      const result = await verifyAccess(req, res)
       if (result){     
         AddItemToDB(body)
       } else {
         res.statusCode(401)
         res.end("token error")
 }
    })

    req.on("end", () => {
      res.end(`todo item '${body.title}' was added`)
    })
  } else
  if (pathname === "/api/todo" && req.method === "PUT") {
    req.on("data",async (data) => {
      body = JSON.parse(data)
      const result = await verifyAccess(req, res)
      if (result) {
         editElement(body)
      } else {
         res.statusCode(401)
         res.end("token error")
      }
     })
    req.on("end", () => {
      res.end(`todo item with id='${body.id}' was modified`)
    })
  } else if (pathname === "/api/todo" && req.method === "DELETE") {
    req.on("data",async (data) => {
      body = JSON.parse(data)
        const result = await verifyAccess(req, res)
         if (result) {
          deleteElement(body)
      } else {
         res.statusCode(401)
         res.end("token error")
      }
    })
    req.on("end", () => {
      res.end(`todo item with id='${body.id}' was deleted`)
    })
  } else if (pathname === "/auth" && req.method === "POST") {
    req.on("data", async (data) => {
      body = JSON.parse(data)
    })
    req.on("end", async () => {
      const result = await addUser(body)
      if (result) {
        res.end("user alredy exist")
            } else {
         res.end(`user was added`)
      }
    })
  } else if (pathname === "/login" && req.method === "POST") {
    req.on("data", async (data) => {
      body = JSON.parse(data)
    })
    req.on("end", async () => {
      const result = await login(body)

      if (result) {
        res.end(JSON.stringify(result))
      } else {
        res.end("Wrong credentials")
      }
    })
  } else if (pathname === "/refresh-tokens" && req.method === "POST") {
     req.on("data", async (data) => {
      body = JSON.parse(data)
     })
    req.on("end", async () => {
      const tokens = await refreshTokens(body)
      res.end(JSON.stringify(tokens))
     })
  }
})

server.listen(8080, () => {
  console.log("The server started on port 8080")
})
