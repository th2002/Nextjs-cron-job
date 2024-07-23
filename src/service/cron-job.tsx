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

async function executeNotificationJob(hours: number) {
  const baseUrl = getServerUrl();
  try {
    await axios.get(`${baseUrl}/api/notifications?hours=${hours}`);
    console.log(`Cron job executed (${hours} hours)`);
  } catch (error) {
    console.error(`Error executing ${hours}-hour cron job:`, error);
  }
}

const CronJob = () => {
  cron.schedule("0 */2 * * *", () => executeNotificationJob(2));
  cron.schedule("0 0 * * *", () => executeNotificationJob(24));
};

export default CronJob;

