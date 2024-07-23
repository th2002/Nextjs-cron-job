import axios from "axios";
import { config } from "../config";
import getAccessTokenUmami from "./get-access-token-umami";

interface PageView {
  x: string;
  y: number;
}

interface CountryView {
  x: string;
  y: number;
}

export async function getAnalyticsData(hours: number) {
  const websiteId = config.umami_website_id;
  const timeZone = "Australia/Sydney";
  const now = new Date();

  // Convert current time to Australia time zone
  const australiaTime = new Date(now.toLocaleString("en-US", { timeZone }));

  const endAt = australiaTime.getTime();

  // Calculate start time (subtract required hours)
  const startAt = new Date(
    australiaTime.getTime() - hours * 60 * 60 * 1000
  ).getTime();

  // Get access token
  const token = await getAccessTokenUmami();

  // Fetch page views
  const pageViewsUrl = `${
    config.umami_api_url
  }/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&unit=hour&timezone=${encodeURIComponent(
    timeZone
  )}&type=url&limit=20`;
  const pageViewsResponse = await axios.get<PageView[]>(pageViewsUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch country views
  const countryViewsUrl = `${
    config.umami_api_url
  }/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&unit=hour&timezone=${encodeURIComponent(
    timeZone
  )}&type=country&limit=20`;
  const countryViewsResponse = await axios.get<CountryView[]>(countryViewsUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  // Combine and format the data
  const formattedData: Record<string, string> = {};
  pageViewsResponse.data.forEach((page) => {
    const pageName = page.x.replace(/^\//, ""); // Remove leading slash
    const countryViews = countryViewsResponse.data
      .map((country) => `${country.y} - ${country.x.toLowerCase()}`)
      .join(", ");
    formattedData[pageName || "home"] = `${countryViews}`;
  });

  return {
    analytics: formattedData,
  };
}

