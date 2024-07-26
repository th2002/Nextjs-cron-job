import axios from "axios";

export type BlocksType = {
  type: string;
  text: {
    type: string;
    text: string;
  };
};

export async function sendSlackNotication(
  message: {
    blocks: BlocksType[];
  },
  noti_endpoint: string
): Promise<void> {
  if (!noti_endpoint) {
    throw new Error("Notication endpoint is not configured");
  }

  const response = await axios.post(noti_endpoint, message);

  if (response.status !== 200) {
    throw new Error("Failed to send Slack message");
  }
}

