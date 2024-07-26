const config = {
  mode: process.env.MODE,
  base_url: process.env.NEXT_PUBLIC_BASE_URL,
  umami_api_url: process.env.UMAMI_API_URL,

  // GEN
  umami_gen_secret_key: process.env.UMAMI_GEN_SECRET_KEY,
  umami_gen_website_id: process.env.UMAMI_GEN_WEBSITE_ID,
  gen_slack_webhook_url: process.env.GEN_SLACK_WEBHOOK_URL,
};

module.exports = { config };

