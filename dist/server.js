"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const next_1 = __importDefault(require("next"));
const cron_job_1 = __importDefault(require("./src/service/cron-job"));
const url_1 = require("url");
require("dotenv/config");
const logger_1 = __importDefault(require("./src/service/logger"));
const port = parseInt(process.env.PORT || "3000", 10);
const isProduction = process.env.MODE !== "DEV";
const app = (0, next_1.default)({ dev: !isProduction });
const handle = app.getRequestHandler();
app
    .prepare()
    .then(() => {
    const server = (0, http_1.createServer)((req, res) => {
        const parsedUrl = (0, url_1.parse)(req.url, true);
        handle(req, res, parsedUrl);
    });
    server.listen(port, async () => {
        (0, cron_job_1.default)();
        logger_1.default.info(`Server listening at http://localhost:${port} as ${!isProduction ? "development" : process.env.MODE}`);
    });
    process.on("SIGTERM", () => {
        logger_1.default.info("SIGTERM signal received: closing HTTP server");
        server.close(() => {
            logger_1.default.info("HTTP server closed");
        });
    });
})
    .catch((err) => {
    logger_1.default.error("Error starting server:", err);
    process.exit(1);
});
