"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
const os_1 = __importDefault(require("os"));
const net_1 = __importDefault(require("net"));
require("dotenv/config");
const MODE = process.env.MODE || "DEV";
const isProduction = MODE !== "DEV";
const defaultPort = process.env.PORT || "3000";
const umami_gen_website_id = process.env.UMAMI_GEN_WEBSITE_ID;
const genUmamiApiUrl = process.env.UMAMI_API_URL;
const genUmamiSecretKey = process.env.UMAMI_GEN_SECRET_KEY;
const gen_noti_endpoint = process.env.GEN_SLACK_WEBHOOK_URL;
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
        await axios_1.default.post(`${baseUrl}/api/notifications?minutes=${minutes}&websiteId=${umami_gen_website_id}`, {
            umamiApiUrl: genUmamiApiUrl,
            umamiSecretKey: genUmamiSecretKey,
            noti_endpoint: gen_noti_endpoint,
        });
        console.log(`Cron job executed (${minutes} minutes)`);
    }
    catch (error) {
        console.error(`Error executing ${minutes}-minutes cron job:`, error);
    }
}
const CronJob = () => {
    node_cron_1.default.schedule("0 */2 * * *", () => executeGenNotificationJob(120));
    node_cron_1.default.schedule("0 0 * * *", () => executeGenNotificationJob(1440));
};
exports.default = CronJob;
