import axios from "axios";
import { config } from "../config";

export async function getUptimeData(hours: number) {
  const response = await axios.post(`${config.umami_api_url}/monitor/up-time`, {
    hours,
    secretKey: config.umami_secret_key,
  });
  return response.data;
}

