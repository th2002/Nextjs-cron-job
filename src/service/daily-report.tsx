import { getAnalyticsData } from "./get-analytics";
import { getUptimeData } from "./get-uptime";
import logger from "./logger";
import { sendSlackNotication } from "./slack-notication";

interface SlackBlock {
  type: string;
  text: {
    type: string;
    text: string;
  };
}

function formatTimeFrame(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  } else {
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? "1 hour" : `${hours} hours`;
  }
}

interface AnalyticsData {
  totalViews: number;
  analytics: Record<string, { totalViews: number; ipDetect: string }>;
}

interface UptimeData {
  uptime: string;
}

function createSlackMessage(
  analyticsData: AnalyticsData,
  uptimeData: UptimeData,
  timeFrame: string
): { blocks: SlackBlock[] } {
  const analyticsBlocks: SlackBlock[] = Object.entries(
    analyticsData.analytics
  ).map(([pageName, pageData]) => ({
    type: "section",
    text: {
      type: "mrkdwn",
      text: `• *${pageName}*:\n  Total views: ${pageData.totalViews}\n  IP detect:\n    ${pageData.ipDetect}`,
    },
  }));

  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Website Analytics and Uptime Report (Last ${timeFrame})*`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Uptime:* ${uptimeData.uptime}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Analytics:*`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Total Views:* ${analyticsData.totalViews}`,
        },
      },
      ...analyticsBlocks,
    ],
  };
}

export async function DailyReport(
  minutes: number,
  websiteId: string,
  umamiApiUrl: string,
  umamiSecretKey: string,
  noti_endpoint: string
) {
  try {
    const hours = Math.ceil(minutes / 60);
    const [analyticsData, uptimeData] = await Promise.all([
      getAnalyticsData(minutes, websiteId, umamiApiUrl, umamiSecretKey),
      getUptimeData(hours),
    ]);

    const timeFrame = formatTimeFrame(minutes);
    const message = createSlackMessage(analyticsData, uptimeData, timeFrame);

    await sendSlackNotication(message, noti_endpoint);
    logger.info("Daily report sent");
    return "Daily report sent";
  } catch (error) {
    logger.error("Error sending notification:", error);
    throw error;
  }
}

