import axios from "axios";
import { config } from "../config";

async function getAccessTokenUmami() {
  try {
    const response = await axios.post(
      `${config.umami_api_url}/auth/verify-secret`,
      {
        secretKey: config.umami_secret_key,
      }
    );

    const accessToken = response.data.token;
    return accessToken;
  } catch (error) {
    console.error("Error getting Umami access token:", error);
    throw error;
  }
}

export default getAccessTokenUmami;

