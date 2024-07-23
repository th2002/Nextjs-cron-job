const config = {
  mode: process.env.MODE,
  base_url: process.env.NEXT_PUBLIC_BASE_URL,
  umami_secret_key: process.env.UMAMI_SECRET_KEY,
  umami_api_url: process.env.UMAMI_API_URL,
  umami_website_id: process.env.UMAMI_WEBSITE_ID,
  umami_script_url: process.env.UMAMI_SCRIPT_URL,
  slack_webhook_url: process.env.SLACK_WEBHOOK_URL,
};

module.exports = { config };

