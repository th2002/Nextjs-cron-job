"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const axios_1 = __importDefault(require("axios"));
const os_1 = __importDefault(require("os"));
const net_1 = __importDefault(require("net"));
const MODE = process.env.MODE || "DEV";
const isProduction = MODE !== "DEV";
const defaultPort = process.env.PORT || "3000";
function getServerUrl() {
    const hostname = net_1.default.isIP(os_1.default.hostname()) ? os_1.default.hostname() : "localhost";
    const isLocalhost = hostname === "localhost";
    const protocol = isProduction && !isLocalhost ? "https" : "http";
    const port = !isProduction && isLocalhost ? `:${defaultPort}` : "";
    return `${protocol}://${hostname}${port}`;
}
async function executeNotificationJob(hours) {
    const baseUrl = getServerUrl();
    try {
        await axios_1.default.get(`${baseUrl}/api/notifications?hours=${hours}`);
        console.log(`Cron job executed (${hours} hours)`);
    }
    catch (error) {
        console.error(`Error executing ${hours}-hour cron job:`, error);
    }
}
const CronJob = () => {
    node_cron_1.default.schedule("0 */2 * * *", () => executeNotificationJob(2));
    node_cron_1.default.schedule("*/10 * * * *", () => executeNotificationJob(24));
    node_cron_1.default.schedule("0 0 * * *", () => executeNotificationJob(24));
};
exports.default = CronJob;
