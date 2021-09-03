const Todo = require("../model/todoModel")
const url = require("url")

function addTodo(res, req) {
  try {
    let body = ""
    req.on("data", (data) => {
      body += data.toString()
    })
    req.on("end", async () => {
      const { title, token } = JSON.parse(body)

      await Item.createItem(title, token)

      res.writeHead(201, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ message: `Item ${title} was added` }))
    })
  } catch (error) {
    res.writeHead(404, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ message: "Item is not created" }))
    console.log(error)
  }
}

async function getItems(req, res) {
  try {
    const accessToken = url
      .parse(req.url, true)
      .query.Authorization.split(" ")[1]
    const items = await Todo.getItems(accessToken)
    if (items instanceof Error) {
      res.writeHead(401, { "Content-Type": "application/json" })
      return res.end(JSON.stringify({ error: items.message }))
    }
  } catch (error) {}
}

module.exports = {
  addTodo,
  getItems,
}
