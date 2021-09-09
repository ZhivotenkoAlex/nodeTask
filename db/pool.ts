import mariadb from "mariadb"

export const pool: mariadb.Pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "111",
  database: "nodeDB",
})





