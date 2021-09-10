"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const mariadb = require("mariadb");
exports.pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '111',
    database: 'nodeDB',
});
//# sourceMappingURL=pool.js.map