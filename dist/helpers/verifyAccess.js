"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyAccess = void 0;
const jwt = require("jsonwebtoken");
const userModel_1 = require("../model/userModel");
const dotenv = require("dotenv");
dotenv.config({ path: __dirname + '/.env' });
class VerifyAccess {
    constructor() {
        this.User = new userModel_1.UserModel();
        this.SECRET = process.env.SECRET;
    }
    async verify(req, res, token) {
        try {
            const payload = jwt.verify(token, this.SECRET);
            const user = await this.User.findUser(payload.id);
            if (!payload) {
                return new Error('invalid token');
            }
            if (payload.type !== 'access') {
                return new Error('wrong token');
            }
            if (user instanceof Error) {
                return new Error('invalid token');
            }
            else if (user.date + user.expiresIn < Date.now()) {
                return new Error('token expired');
            }
            if (!user) {
                return new Error('invalid token');
            }
        }
        catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                return new Error('error token');
            }
        }
        return true;
    }
}
exports.VerifyAccess = VerifyAccess;
//# sourceMappingURL=verifyAccess.js.map