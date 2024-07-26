import cron from "node-cron";
import axios from "axios";
import os from "os";
import net from "net";
import "dotenv/config";

const MODE = process.env.MODE || "DEV";

const isProduction = MODE !== "DEV";
const defaultPort = process.env.PORT || "3000";

const umami_gen_website_id = process.env.UMAMI_GEN_WEBSITE_ID;
const genUmamiApiUrl = process.env.UMAMI_API_URL;
const genUmamiSecretKey = process.env.UMAMI_GEN_SECRET_KEY;
const gen_noti_endpoint = process.env.GEN_SLACK_WEBHOOK_URL;

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
      `${baseUrl}/api/notifications?minutes=${minutes}&websiteId=${umami_gen_website_id}`,
      {
        umamiApiUrl: genUmamiApiUrl,
        umamiSecretKey: genUmamiSecretKey,
        noti_endpoint: gen_noti_endpoint,
      }
    );
    console.log(`Cron job executed (${minutes} minutes)`);
  } catch (error) {
    console.error(`Error executing ${minutes}-minutes cron job:`, error);
  }
}

const CronJob = () => {
  cron.schedule("0 */2 * * *", () => executeGenNotificationJob(120));
  cron.schedule("0 0 * * *", () => executeGenNotificationJob(1440));
};

export default CronJob;

