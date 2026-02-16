import { users } from "@/lib/sampleData";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("id");
  if (!userId) {
    return NextResponse.json(users);
  }

  const user = users.find((candidate) => candidate.id === userId);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
