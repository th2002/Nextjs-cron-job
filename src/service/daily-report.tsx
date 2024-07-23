import { countryMap } from "../app/mock/country";
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

export async function DailyReport(hours: number) {
  try {
    const [analyticsData, uptimeData] = await Promise.all([
      getAnalyticsData(hours || 2),
      getUptimeData(hours || 2),
    ]);

    let totalVisitors = 0;
    const analyticsBlocks: SlackBlock[] = [];

    for (const [pageName, visitorInfo] of Object.entries(
      analyticsData.analytics
    )) {
      const displayPageName =
        pageName === "en" ? "home" : pageName.replace("en/", "");

      if (typeof visitorInfo === "string") {
        const formattedVisitors: string[] = [];
        const visitors = visitorInfo.split(", ");

        for (const info of visitors) {
          const [count, country] = info.split(" - ");
          const visitorCount = parseInt(count, 10);

          if (!isNaN(visitorCount)) {
            totalVisitors += visitorCount;
          }

          if (country) {
            const countryInfo = countryMap[country.toLowerCase()];
            if (countryInfo) {
              formattedVisitors.push(
                `${count} ${countryInfo.flag} ${countryInfo.name}`
              );
            } else {
              formattedVisitors.push(info);
            }
          } else {
            formattedVisitors.push(info);
          }
        }

        analyticsBlocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `• ${displayPageName}: ${formattedVisitors.join(", ")}`,
          },
        });
      }
    }

    const message: { blocks: SlackBlock[] } = {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Website Analytics and Uptime Report (Last ${hours} hours)*`,
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
            text: "*Analytics:*\n- Total Visitors: " + totalVisitors,
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
  }
}

