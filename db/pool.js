const mariadb = require("mariadb")

const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "111",
  database: "nodeDB",
})
module.exports = {
    pool
}