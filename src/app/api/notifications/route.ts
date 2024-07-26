import { DailyReport } from "@/service/daily-report";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const minutes = parseInt(searchParams.get("minutes") || "5", 10);
  const websiteId = searchParams.get("websiteId");

  const body = await request.json();
  const { umamiApiUrl, umamiSecretKey, noti_endpoint } = body;

  if (!minutes) {
    return NextResponse.json(
      { message: "Minutes params is required" },
      { status: 400 }
    );
  }

  if (!websiteId) {
    return NextResponse.json(
      { message: "Website ID is required" },
      { status: 400 }
    );
  }

  if (!umamiApiUrl || !umamiSecretKey) {
    return NextResponse.json(
      { message: "umamiApiUrl and umamiSecretKey are required" },
      { status: 400 }
    );
  }

  await DailyReport(
    minutes,
    websiteId,
    umamiApiUrl,
    umamiSecretKey,
    noti_endpoint
  );
  return NextResponse.json({ message: "Notification sent" });
}

