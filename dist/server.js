"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const next_1 = __importDefault(require("next"));
const cron_job_1 = __importDefault(require("./src/service/cron-job"));
const port = parseInt(process.env.PORT || "3000", 10);
const isProduction = process.env.MODE !== "DEV";
const app = (0, next_1.default)({ dev: !isProduction });
const handle = app.getRequestHandler();
app.prepare().then(() => {
    (0, http_1.createServer)((req, res) => {
        handle(req, res);
    }).listen(port, async () => {
        (0, cron_job_1.default)();
        console.log(`> Server listening at http://localhost:${port} as ${!isProduction ? "development" : process.env.NODE_ENV}`);
    });
});
