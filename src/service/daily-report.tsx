import { getAnalyticsData } from "./get-analytics";
import { getUptimeData } from "./get-uptime";
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

export async function DailyReport(minutes: number) {
  try {
    const [analyticsData, uptimeData] = await Promise.all([
      getAnalyticsData(minutes),
      getUptimeData(minutes),
    ]);

    const analyticsBlocks: SlackBlock[] = [];

    for (const [pageName, visitorInfo] of Object.entries(
      analyticsData.analytics
    )) {
      const displayPageName = pageName === "home" ? "home" : pageName;

      analyticsBlocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `• ${displayPageName}: ${visitorInfo}`,
        },
      });
    }

    const timeFrame = formatTimeFrame(minutes);

    const message: { blocks: SlackBlock[] } = {
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

    await sendSlackNotication(message);
    console.log("Daily report sent");
    return "Daily report sent";
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
}

