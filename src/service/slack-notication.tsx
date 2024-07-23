import axios from "axios";
import { config } from "../config";

export interface SlackBlock {
  type: string;
  text: {
    type: string;
    text: string;
  };
}

export async function sendSlackNotication(message: {
  blocks: SlackBlock[];
}): Promise<void> {
  if (!config.slack_webhook_url) {
    throw new Error("Slack webhook URL is not configured");
  }

  const response = await axios.post(config.slack_webhook_url, message);

  if (response.status !== 200) {
    throw new Error("Failed to send Slack message");
  }
}

