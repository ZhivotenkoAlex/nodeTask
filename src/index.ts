import {server} from "./app"

const port = 8080;

server.listen(port, () => {
    console.log('The server started on port 8080');
  });
