import { getContestById, getContestJoinRequests, getContestPhase, getContestProblems, getContestSubmissions, getProblemStats, getStandings } from "@/lib/contestUtils";
import { addRandomSubmission, createContestWithProblems, getMockState, mockRunCode, requestJoinContest, updateJoinRequest } from "@/lib/mockDb";
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

/**
 * Fake fetch helper so this file can be replaced by real backend calls later.
 * Swap internals of this function with `fetch('/api/...')` and keep callers unchanged.
 */
async function fakeFetch<T>(builder: () => T, delayMs = 220): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(builder()), delayMs);
  });
}

export async function fetchContests(): Promise<Contest[]> {
  return fakeFetch(() => getMockState().contests);
}

export async function fetchUsers(): Promise<User[]> {
  return fakeFetch(() => getMockState().users);
}

export async function fetchContestDetail(contestId: string): Promise<ContestResponse> {
  return fakeFetch(() => {
    const state = getMockState();
    const contest = getContestById(state.contests, contestId);
    if (!contest) throw new Error("Contest not found");

    return {
      contest,
      phase: getContestPhase(contest),
      problems: getContestProblems(state.problems, contest),
      standings: getStandings(contest, state.submissions),
      joinRequests: getContestJoinRequests(contestId, state.joinRequests, state.users),
      events: getContestSubmissions(state.submissions, contestId),
      problemStats: getProblemStats(contest, state.problems, state.submissions)
    };
  });
}

export async function createContest(payload: Parameters<typeof createContestWithProblems>[0]) {
  return fakeFetch(() => createContestWithProblems(payload));
}

export async function sendJoinRequest(contestId: string, participantId: string) {
  return fakeFetch(() => requestJoinContest(contestId, participantId));
}

export async function reviewJoinRequest(requestId: string, status: "approved" | "rejected") {
  return fakeFetch(() => updateJoinRequest(requestId, status));
}

export async function runCode() {
  return fakeFetch(() => ({
    stdout: mockRunCode(),
    stderr: null,
    compile_output: null,
    status: { description: "Finished" }
  }), 650);
}

export async function submitCode(payload: {
  contestId: string;
  participantId: string;
  problemId: string;
  language: string;
}) {
  return fakeFetch(() => addRandomSubmission(payload), 720);
}
