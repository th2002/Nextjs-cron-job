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
      let pageName = page.x.replace(/^\//, "").replace(/^en\//, "");
      if (pageName === "en" || pageName === "") pageName = "home";
      analytics[pageName] = {
        views: page.y,
        countries: {},
      };
    });

    for (const pageName of Object.keys(analytics)) {
      let url;
      if (pageName === "home") {
        url = ["/", "/en"]; // Check both root and /en for home page
      } else {
        url = `/en/${pageName}`;
      }

      let countryViewsResponse;
      if (Array.isArray(url)) {
        // For home page, try both URLs
        const responses = await Promise.all(
          url.map((u) =>
            axios.get<CountryView[]>(
              `${
                config.umami_api_url
              }/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&unit=minute&type=country&url=${encodeURIComponent(
                u
              )}&limit=20`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            )
          )
        );
        // Combine results from both URLs
        countryViewsResponse = {
          data: responses.flatMap((response) => response.data),
        };
      } else {
        countryViewsResponse = await axios.get<CountryView[]>(
          `${
            config.umami_api_url
          }/websites/${websiteId}/metrics?startAt=${startAt}&endAt=${endAt}&unit=minute&type=country&url=${encodeURIComponent(
            url
          )}&limit=20`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      console.log(`Country views for ${pageName}:`, countryViewsResponse.data);

      if (countryViewsResponse.data.length === 0) {
        console.log(`No country data for page: ${pageName}`);
      }

      countryViewsResponse.data.forEach((country) => {
        const lowerCountry = country.x.toLowerCase();
        analytics[pageName].countries[lowerCountry] =
          (analytics[pageName].countries[lowerCountry] || 0) + country.y;
      });
    }

    const formattedData: Record<
      string,
      { totalViews: number; ipDetect: string }
    > = {};
    let totalViews = 0;

    for (const [pageName, pageData] of Object.entries(analytics)) {
      totalViews += pageData.views;
      const countryViews = Object.entries(pageData.countries)
        .sort((a, b) => b[1] - a[1]) // Sort by view count, descending
        .map(([country, views]) => {
          const countryInfo = countryMap[country.toLowerCase()] || {
            flag: "🏳️",
            name: country,
          };
          return `${views} ${countryInfo.name} ${countryInfo.flag}`;
        })
        .join("\n    ");
      formattedData[pageName] = {
        totalViews: pageData.views,
        ipDetect: countryViews || "No country data",
      };
    }

    return {
      analytics: formattedData,
      totalViews: totalViews,
    };
  } catch (error) {
    console.error("Error in getAnalyticsData:", error);
    throw error;
  }
}
