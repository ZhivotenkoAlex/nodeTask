import * as http from 'http';
import * as url from 'url';
import { UserController } from './controller/userController';
import { TodoController } from './controller/todoController';

const User = new UserController();
const Todo = new TodoController();


export const server: http.Server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET,POST,PATCH,DELETE,OPTIONS',
  );
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (
    req.method
    && ['GET', 'POST', 'PATCH', 'DELETE'].indexOf(req.method) > -1
  ) {
    const { pathname } = url.parse(<string>req.url, true);
    // Users paths
    if (pathname === '/api/user' && req.method === 'GET') {
      User.getUser(req, res);
    } else if (pathname === '/api/user' && req.method === 'POST') {
      User.createUser(req, res);
    } else if (pathname === '/api/auth/login' && req.method === 'POST') {
      User.login(req, res);
    } else if (
      pathname === '/api/auth/refresh_tokens'
      && req.method === 'POST'
    ) {
      User.refreshTokens(req, res);
    }

    // Todo paths
    if (pathname === '/api/todo' && req.method === 'GET') {
      Todo.getItems(req, res);
    } else if (pathname === '/api/todo/id' && req.method === 'GET') {
      Todo.getItemById(req, res);
    } else if (pathname === '/api/todo' && req.method === 'POST') {
      Todo.addItem(req, res);
    } else if (pathname === '/api/todo/title' && req.method === 'PATCH') {
      Todo.editItem(req, res);
    } else if (pathname === '/api/todo/check' && req.method === 'PATCH') {
      Todo.setCheck(req, res);
    } else if (pathname === '/api/todo' && req.method === 'DELETE') {
      Todo.deleteItem(req, res);
    }
    return;
  }

  res.writeHead(405);
  res.end(
    JSON.stringify({ error: `${req.method} is not allowed for the request.` }),
  );
});


