const http = require("http")
const url = require("url")
const mariadb = require("mariadb")

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "111",
  database: "nodeDB",
})
