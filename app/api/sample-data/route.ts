import { contests, joinRequests, problems, submissions, users } from "@/lib/sampleData";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ users, contests, problems, submissions, joinRequests });
}
