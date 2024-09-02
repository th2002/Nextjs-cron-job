"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const axios_1 = __importDefault(require("axios"));
const os_1 = __importDefault(require("os"));
const net_1 = __importDefault(require("net"));
const node_schedule_1 = require("node-schedule");
const config_1 = require("../config");
const logger_1 = __importDefault(require("./logger"));
const isProduction = process.env.MODE !== "DEV";
const defaultPort = process.env.PORT || 3000;
function getServerUrl() {
    const hostname = net_1.default.isIP(os_1.default.hostname()) ? os_1.default.hostname() : "localhost";
    const isLocalhost = hostname === "localhost";
    const protocol = isProduction && !isLocalhost ? "https" : "http";
    const port = !isProduction && isLocalhost ? `:${defaultPort}` : "";
    return `${protocol}://${hostname}${port}`;
}
async function executeGenNotificationJob(minutes) {
    const baseUrl = getServerUrl();
    try {
        await axios_1.default.post(`${baseUrl}/api/notifications?minutes=${minutes}&websiteId=${config_1.config.umami_gen_website_id}`, {
            umamiApiUrl: config_1.config.umami_api_url,
            umamiSecretKey: config_1.config.umami_gen_secret_key,
            noti_endpoint: config_1.config.gen_slack_webhook_url,
        });
        logger_1.default.info(`Cron job executed (${minutes} minutes)`);
    }
    catch (error) {
        logger_1.default.error(`Error executing ${minutes}-minutes cron job:`, error);
    }
}
const CronJob = () => {
    (0, node_schedule_1.schedule)(process.env.CRON_SCHEDULE_2HOURS || "0 */2 * * *", () => executeGenNotificationJob(120));
    (0, node_schedule_1.schedule)(process.env.CRON_SCHEDULE_DAILY || "0 0 * * *", () => executeGenNotificationJob(1440));
};
exports.default = CronJob;
