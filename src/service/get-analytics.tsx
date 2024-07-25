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

interface PageAnalytics {
  views: number;
  countries: Record<string, number>;
}

export async function getAnalyticsData(hours: number) {
  const websiteId = config.umami_website_id;
  const now = new Date();

  const endAt = now.getTime();

  // Calculate start time (subtract required hours)
  const startAt = new Date(now.getTime() - hours * 60 * 60 * 1000).getTime();

  // Get access token
  const token = await getAccessTokenUmami();

  // Fetch page views
  const pageViewsUrl = `${config.umami_api_url}/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&unit=hour&type=url&limit=20`;
  const pageViewsResponse = await axios.get<PageView[]>(pageViewsUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Initialize analytics object
  const analytics: Record<string, PageAnalytics> = {};

  // Process page views
  pageViewsResponse.data.forEach((page) => {
    const pageName = page.x.replace(/^\//, "") || "home";
    analytics[pageName] = {
      views: page.y,
      countries: {},
    };
  });

  // Fetch country views for each page
  for (const pageName of Object.keys(analytics)) {
    const countryViewsUrl = `${
      config.umami_api_url
    }/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&unit=hour&type=country&url=${encodeURIComponent(
      pageName === "home" ? "/" : `/${pageName}`
    )}&limit=20`;
    const countryViewsResponse = await axios.get<CountryView[]>(
      countryViewsUrl,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    countryViewsResponse.data.forEach((country) => {
      analytics[pageName].countries[country.x.toLowerCase()] = country.y;
    });
  }

  // Format the data
  const formattedData: Record<string, string> = {};
  for (const [pageName, pageData] of Object.entries(analytics)) {
    const countryViews = Object.entries(pageData.countries)
      .map(([country, views]) => `${views} - ${country}`)
      .join(", ");
    formattedData[pageName] = countryViews;
  }

  return {
    analytics: formattedData,
  };
}

