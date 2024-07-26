import axios from "axios";

async function getAccessTokenUmami(
  umamiApiUrl: string,
  umamiSecretKey: string
) {
  try {
    const response = await axios.post(`${umamiApiUrl}/auth/verify-secret`, {
      secretKey: umamiSecretKey,
    });

    const accessToken = response.data.token;
    return accessToken;
  } catch (error) {
    console.error("Error getting Umami access token:", error);
    throw error;
  }
}

export default getAccessTokenUmami;

