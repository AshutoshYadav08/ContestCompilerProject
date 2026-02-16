import { contests } from "@/lib/sampleData";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(contests);
}
