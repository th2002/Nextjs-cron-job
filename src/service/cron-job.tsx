import cron from "node-cron";
import axios from "axios";
import os from "os";
import net from "net";

const MODE = process.env.MODE || "DEV";

const isProduction = MODE !== "DEV";
const defaultPort = process.env.PORT || "3000";

function getServerUrl() {
  const hostname = net.isIP(os.hostname()) ? os.hostname() : "localhost";
  const isLocalhost = hostname === "localhost";
  const protocol = isProduction && !isLocalhost ? "https" : "http";
  const port = !isProduction && isLocalhost ? `:${defaultPort}` : "";
  return `${protocol}://${hostname}${port}`;
}

async function executeNotificationJob(minutes: number) {
  const baseUrl = getServerUrl();
  try {
    await axios.get(`${baseUrl}/api/notifications?minutes=${minutes}`);
    console.log(`Cron job executed (${minutes} minutes)`);
  } catch (error) {
    console.error(`Error executing ${minutes}-minutes cron job:`, error);
  }
}

const CronJob = () => {
  cron.schedule("*/5 * * * *", () => executeNotificationJob(5));
  cron.schedule("0 */2 * * *", () => executeNotificationJob(120));
  cron.schedule("0 0 * * *", () => executeNotificationJob(1440));
};

export default CronJob;

