import { Contest, Problem, StandingsRow, Submission, User } from "@/types";

export type ContestResponse = {
  contest: Contest;
  phase: "upcoming" | "running" | "ended";
  problems: Problem[];
  standings: StandingsRow[];
  joinRequests: Array<{
    id: string;
    contestId: string;
    participantId: string;
    status: "pending" | "approved" | "rejected";
    requestedAt: string;
    participant?: User;
  }>;
  events: Submission[];
  problemStats: Array<{
    problemId: string;
    title: string;
    triedBy: number;
    solvedBy: number;
    acceptanceRate: number;
  }>;
};

export async function fetchContests(): Promise<Contest[]> {
  const response = await fetch("/api/contests");
  if (!response.ok) throw new Error("Failed to load contests");
  return response.json();
}

export async function fetchContestDetail(contestId: string): Promise<ContestResponse> {
  const response = await fetch(`/api/contest?id=${contestId}`);
  if (!response.ok) throw new Error("Failed to load contest details");
  return response.json();
}

export async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/users");
  if (!response.ok) throw new Error("Failed to load users");
  return response.json();
}
