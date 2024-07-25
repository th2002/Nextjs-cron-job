import { DailyReport } from "@/service/daily-report";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const minutes = parseInt(searchParams.get("minutes") || "5", 10);

  await DailyReport(minutes);
  return NextResponse.json({ message: "Notification sent" });
}

