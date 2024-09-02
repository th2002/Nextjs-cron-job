import "dotenv/config";

import axios from "axios";
import os from "os";
import net from "net";
import schedule from "node-schedule";
import { config } from "../config";
import logger from "./logger";

const isProduction = process.env.MODE !== "DEV";
const defaultPort = process.env.PORT || 3000;

function getServerUrl() {
  const hostname = net.isIP(os.hostname()) ? os.hostname() : "localhost";
  const isLocalhost = hostname === "localhost";
  const protocol = isProduction && !isLocalhost ? "https" : "http";
  const port = !isProduction && isLocalhost ? `:${defaultPort}` : "";
  return `${protocol}://${hostname}${port}`;
}

async function executeGenNotificationJob(minutes: number) {
  const baseUrl = getServerUrl();
  try {
    await axios.post(
      `${baseUrl}/api/notifications?minutes=${minutes}&websiteId=${config.umami_gen_website_id}`,
      {
        umamiApiUrl: config.umami_api_url,
        umamiSecretKey: config.umami_gen_secret_key,
        noti_endpoint: config.gen_slack_webhook_url,
      }
    );
    logger.info(`Cron job executed (${minutes} minutes)`);
  } catch (error) {
    logger.error(`Error executing ${minutes}-minutes cron job:`, error);
  }
}

const CronJob = () => {
  schedule.scheduleJob(process.env.CRON_SCHEDULE_2HOURS || "0 */2 * * *", () =>
    executeGenNotificationJob(120)
  );
  schedule.scheduleJob(process.env.CRON_SCHEDULE_DAILY || "0 0 * * *", () =>
    executeGenNotificationJob(1440)
  );
};

export default CronJob;

