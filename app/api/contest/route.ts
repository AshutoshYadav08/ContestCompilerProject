import { getContestById, getContestJoinRequests, getContestPhase, getContestProblems, getContestSubmissions, getProblemStats, getStandings } from "@/lib/contestUtils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const contestId = request.nextUrl.searchParams.get("id");
  if (!contestId) {
    return NextResponse.json({ message: "Contest id is required" }, { status: 400 });
  }

  const contest = getContestById(contestId);
  if (!contest) {
    return NextResponse.json({ message: "Contest not found" }, { status: 404 });
  }

  return NextResponse.json({
    contest,
    phase: getContestPhase(contest),
    problems: getContestProblems(contest),
    standings: getStandings(contest),
    joinRequests: getContestJoinRequests(contestId),
    events: getContestSubmissions(contestId),
    problemStats: getProblemStats(contest)
  });
}
