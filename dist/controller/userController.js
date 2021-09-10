"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userModel_1 = require("../model/userModel");
const url = require("url");
class UserController {
    constructor() {
        this.User = new userModel_1.UserModel();
    }
    async getUser(req, res) {
        try {
            const item = url.parse(req.url, true).query.item;
            const user = await this.User.findUser(item);
            if (!user) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'User not found' }));
            }
            else {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(user));
            }
        }
        catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User is not found' }));
            console.log(error);
        }
    }
    createUser(req, res) {
        try {
            let body = '';
            req.on('data', (data) => {
                body += data.toString();
            });
            req.on('end', async () => {
                const { email, password } = JSON.parse(body);
                const user = await this.User.addUser(email, password);
                if (user instanceof Error) {
                    res.writeHead(422, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: user.message }));
                }
                res.writeHead(201, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ message: `User with email ${email} was added` }));
            });
        }
        catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User is not created' }));
            console.log(error);
        }
    }
    login(req, res) {
        try {
            let body = '';
            req.on('data', (data) => {
                body += data.toString();
            });
            req.on('end', async () => {
                const { email, password } = JSON.parse(body);
                const tokens = await this.User.login(email, password);
                if (tokens instanceof Error) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: tokens.message }));
                }
                else if (tokens) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(tokens));
                }
            });
        }
        catch (error) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Wrong credentials' }));
            console.log(error);
        }
    }
    refreshTokens(req, res) {
        try {
            let body = '';
            req.on('data', (data) => {
                body += data.toString();
            });
            req.on('end', async () => {
                const token = JSON.parse(body).refreshToken;
                const tokens = await this.User.refreshTokens(token);
                if (tokens instanceof Error) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Wrong token' }));
                }
                res.end(JSON.stringify(tokens));
            });
        }
        catch (error) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Wrong token' }));
            console.log(error);
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=userController.js.map