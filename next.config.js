/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  env: {
    MODE: process.env.MODE,
    UMAMI_API_URL: process.env.UMAMI_API_URL,
    UMAMI_SECRET_KEY: process.env.UMAMI_SECRET_KEY,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    UMAMI_WEBSITE_ID: process.env.UMAMI_WEBSITE_ID,
    UMAMI_SCRIPT_URL: process.env.UMAMI_SCRIPT_URL,
  },
};

module.exports = nextConfig;

