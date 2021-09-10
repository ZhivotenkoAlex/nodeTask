"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoController = void 0;
const url = require("url");
const todoModel_1 = require("../model/todoModel");
const verifyAccess_1 = require("../helpers/verifyAccess");
class TodoController {
    constructor() {
        this.Todo = new todoModel_1.TodoModel();
        this.Verify = new verifyAccess_1.VerifyAccess();
    }
    async getItemById(req, res) {
        const { query } = url.parse(req.url, true);
        const token = query.Authorization.split(' ')[1];
        try {
            const result = await this.Verify.verify(req, res, token);
            if (result instanceof Error) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: result.message }));
            }
            const item = await this.Todo.getItemById(query.id);
            res.end(JSON.stringify(item));
        }
        catch (err) {
            res.statusCode = 404;
            res.end(`There are no item with id=${query.id}`);
        }
    }
    async getItems(req, res) {
        try {
            const { query } = url.parse(req.url, true);
            const accessToken = query.Authorization.split(' ')[1];
            const result = await this.Verify.verify(req, res, accessToken);
            if (result instanceof Error) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: result.message }));
            }
            if (result) {
                const items = await this.Todo.getItems(accessToken);
                if (items instanceof Error) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: items.message }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify(items));
            }
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Item does not exist' }));
        }
        catch (error) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: error }));
        }
    }
    async addItem(req, res) {
        try {
            let body = '';
            req.on('data', (data) => {
                body += data.toString();
            });
            req.on('end', async () => {
                const { title, token } = JSON.parse(body);
                const result = await this.Verify.verify(req, res, token.split(' ')[1]);
                if (result instanceof Error) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: result.message }));
                }
                await this.Todo.createItem(title, token);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: `Item ${title} was added` }));
            });
        }
        catch (error) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Item is not created' }));
            console.log(error);
        }
    }
    async editItem(req, res) {
        try {
            let body = '';
            req.on('data', (data) => {
                body += data.toString();
            });
            req.on('end', async () => {
                const { title, id, token } = JSON.parse(body);
                const result = await this.Verify.verify(req, res, token.split(' ')[1]);
                if (result instanceof Error) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: result.message }));
                }
                const responseDb = await this.Todo.editElement(title, id);
                if (responseDb instanceof Error) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Item does not exist' }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: `Item ${title} was changed` }));
            });
        }
        catch (error) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Item is not changed' }));
            console.log(error);
        }
    }
    async setCheck(req, res) {
        try {
            let body = '';
            req.on('data', (data) => {
                body += data.toString();
            });
            req.on('end', async () => {
                const { checked, id, token } = JSON.parse(body);
                const result = await this.Verify.verify(req, res, token.split(' ')[1]);
                if (result instanceof Error) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: result.message }));
                }
                const responseDb = await this.Todo.setCheck(checked, id);
                if (responseDb instanceof Error) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Item does not exist' }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: `Item ${id} was changed` }));
            });
        }
        catch (error) {
            console.log('error', error);
        }
    }
    async deleteItem(req, res) {
        try {
            let body = '';
            req.on('data', (data) => {
                body += data.toString();
            });
            req.on('end', async () => {
                const { id, token } = JSON.parse(body);
                const result = await this.Verify.verify(req, res, token.split(' ')[1]);
                if (result instanceof Error) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: result.message }));
                }
                const responseDb = await this.Todo.deleteElement(id);
                if (responseDb instanceof Error) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Item does not exist' }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: `Item ${id} was deleted` }));
            });
        }
        catch (error) {
            console.log('error', error);
        }
    }
}
exports.TodoController = TodoController;
//# sourceMappingURL=todoController.js.map