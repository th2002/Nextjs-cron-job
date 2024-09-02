"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
console.log("Environment Variables:", process.env);
function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
exports.config = {
    mode: process.env.MODE || "DEV",
    base_url: requireEnv("NEXT_PUBLIC_BASE_URL"),
    umami_api_url: requireEnv("UMAMI_API_URL"),
    umami_gen_secret_key: requireEnv("UMAMI_GEN_SECRET_KEY"),
    umami_gen_website_id: requireEnv("UMAMI_GEN_WEBSITE_ID"),
    gen_slack_webhook_url: requireEnv("GEN_SLACK_WEBHOOK_URL"),
};
