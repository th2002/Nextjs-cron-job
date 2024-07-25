import axios from "axios";
import { config } from "../config";
import getAccessTokenUmami from "./get-access-token-umami";
import { countryMap } from "@/mock/country";

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

export async function getAnalyticsData(minutes: number) {
  try {
    const websiteId = config.umami_website_id;
    const now = new Date();
    const endAt = now.getTime();
    const startAt = new Date(now.getTime() - minutes * 60 * 1000).getTime();

    const token = await getAccessTokenUmami();

    const pageViewsUrl = `${config.umami_api_url}/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&unit=minute&type=url&limit=20`;

    const pageViewsResponse = await axios.get<PageView[]>(pageViewsUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Page views response:", pageViewsResponse.data);

    const analytics: Record<string, PageAnalytics> = {};

    pageViewsResponse.data.forEach((page) => {
      const pageName = page.x.replace(/^\//, "") || "home";
      analytics[pageName] = {
        views: page.y,
        countries: {},
      };
    });

    for (const pageName of Object.keys(analytics)) {
      const countryViewsUrl = `${
        config.umami_api_url
      }/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&unit=minute&type=country&url=${encodeURIComponent(
        pageName === "home" ? "/" : `/${pageName}`
      )}&limit=20`;

      const countryViewsResponse = await axios.get<CountryView[]>(
        countryViewsUrl,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log(`Country views for ${pageName}:`, countryViewsResponse.data);

      if (countryViewsResponse.data.length === 0) {
        console.log(`No country data for page: ${pageName}`);
      }

      countryViewsResponse.data.forEach((country) => {
        analytics[pageName].countries[country.x.toLowerCase()] = country.y;
      });
    }

    const formattedData: Record<string, string> = {};
    let totalViews = 0;

    for (const [pageName, pageData] of Object.entries(analytics)) {
      totalViews += pageData.views;
      const countryViews = Object.entries(pageData.countries)
        .map(([country, views]) => {
          const countryInfo = countryMap[country.toLowerCase()] || {
            flag: "🏳️",
            name: country,
          };
          return `${views} ${countryInfo.flag} ${countryInfo.name}`;
        })
        .join(", ");
      formattedData[pageName] = `${pageData.views} views: ${
        countryViews || "No country data"
      }`;
    }

    return {
      analytics: formattedData,
      totalViews: `${totalViews} total views`,
    };
  } catch (error) {
    console.error("Error in getAnalyticsData:", error);
    throw error;
  }
}

