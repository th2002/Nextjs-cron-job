/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  env: {
    MODE: process.env.MODE,
    UMAMI_API_URL: process.env.UMAMI_API_URL,

    // GEN
    UMAMI_GEN_SECRET_KEY: process.env.UMAMI_GEN_SECRET_KEY,
    UMAMI_GEN_WEBSITE_ID: process.env.UMAMI_GEN_WEBSITE_ID,
    UMAMI_GEN_SCRIPT_URL: process.env.UMAMI_GEN_SCRIPT_URL,
    GEN_SLACK_WEBHOOK_URL: process.env.GEN_SLACK_WEBHOOK_URL,
  },
};

module.exports = nextConfig;

