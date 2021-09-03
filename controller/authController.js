const Auth = require("../model/authModel")

function login(req, res) {
  try {
    let body = ""
    req.on("data", (data) => {
      body += data.toString()
    })
    req.on("end", async () => {
      const { email, password } = JSON.parse(body)

      const tokens = await Auth.login(email, password)
      console.log("==tokens==")
      console.log(tokens)
      if (tokens instanceof Error) {
        res.writeHead(401, { "Content-Type": "application/json" })
        return res.end(JSON.stringify(tokens))
      } else if (tokens) {
        res.writeHead(200, { "Content-Type": "application/json" })
        res.end(JSON.stringify(tokens))
      }
    })
  } catch (error) {}
}

module.exports = {
  login,
}
