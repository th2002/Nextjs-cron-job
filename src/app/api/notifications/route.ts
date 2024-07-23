import { DailyReport } from "@/src/service/daily-report";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hours = parseInt(searchParams.get("hours") || "24", 10);

  await DailyReport(hours);
  return NextResponse.json({ message: "Notification sent" });
}

