import { contests as seedContests, joinRequests as seedJoinRequests, problems as seedProblems, submissions as seedSubmissions, users as seedUsers } from "@/lib/sampleData";
import { Contest, JoinRequest, Problem, Submission, SubmissionStatus, User } from "@/types";

type MockState = {
  users: User[];
  contests: Contest[];
  problems: Problem[];
  submissions: Submission[];
  joinRequests: JoinRequest[];
};

const STORAGE_KEY = "contest-compiler-mock-db-v1";

function cloneSeed(): MockState {
  return {
    users: structuredClone(seedUsers),
    contests: structuredClone(seedContests),
    problems: structuredClone(seedProblems),
    submissions: structuredClone(seedSubmissions),
    joinRequests: structuredClone(seedJoinRequests)
  };
}

export function getMockState(): MockState {
  if (typeof window === "undefined") {
    return cloneSeed();
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const seed = cloneSeed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  return JSON.parse(raw) as MockState;
}

export function setMockState(next: MockState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("mock-db-updated"));
}

export function withMockState<T>(updater: (state: MockState) => T): T {
  const current = getMockState();
  const result = updater(current);
  setMockState(current);
  return result;
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createContestWithProblems(payload: {
  organiserId: string;
  name: string;
  description: string;
  startTime: string;
  durationMinutes: number;
  visibility: "public" | "private";
  penaltyPerWrongMinutes: number;
  maxSubmissionsPerProblem: number;
  allowLateJoin: boolean;
  freezeLeaderboardLastMinutes: number;
  problems: Array<{
    title: string;
    code: string;
    statement: string;
    constraints: string;
    points: number;
    sampleInput: string;
    sampleOutput: string;
  }>;
}) {
  return withMockState((state) => {
    const createdProblemIds: string[] = [];

    payload.problems.forEach((draft) => {
      const problemId = id("prob");
      createdProblemIds.push(problemId);
      state.problems.push({
        id: problemId,
        code: draft.code,
        title: draft.title,
        statement: draft.statement,
        constraints: draft.constraints.split("\n").filter(Boolean),
        points: draft.points,
        tags: ["custom"],
        testCases: [
          { id: id("t"), input: draft.sampleInput, output: draft.sampleOutput, isHidden: false },
          { id: id("t"), input: draft.sampleInput, output: draft.sampleOutput, isHidden: true }
        ]
      });
    });

    const contestId = id("contest");
    state.contests.unshift({
      id: contestId,
      name: payload.name,
      description: payload.description,
      slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      organiserId: payload.organiserId,
      startTime: payload.startTime,
      durationMinutes: payload.durationMinutes,
      visibility: payload.visibility,
      settings: {
        maxSubmissionsPerProblem: payload.maxSubmissionsPerProblem,
        penaltyPerWrongMinutes: payload.penaltyPerWrongMinutes,
        allowLateJoin: payload.allowLateJoin,
        freezeLeaderboardLastMinutes: payload.freezeLeaderboardLastMinutes
      },
      problemIds: createdProblemIds,
      participants: [],
      joinRequestIds: []
    });

    return contestId;
  });
}

export function requestJoinContest(contestId: string, participantId: string) {
  withMockState((state) => {
    const contest = state.contests.find((entry) => entry.id === contestId);
    if (!contest) return;

    const existing = state.joinRequests.find(
      (request) => request.contestId === contestId && request.participantId === participantId
    );
    if (existing) return;

    const req: JoinRequest = {
      id: id("jr"),
      contestId,
      participantId,
      status: "pending",
      requestedAt: new Date().toISOString()
    };
    state.joinRequests.push(req);
    contest.joinRequestIds.push(req.id);
  });
}

export function updateJoinRequest(requestId: string, status: "approved" | "rejected") {
  withMockState((state) => {
    const request = state.joinRequests.find((candidate) => candidate.id === requestId);
    if (!request) return;

    request.status = status;
    const contest = state.contests.find((entry) => entry.id === request.contestId);
    if (status === "approved" && contest && !contest.participants.includes(request.participantId)) {
      contest.participants.push(request.participantId);
    }
  });
}

export function addRandomSubmission(payload: {
  contestId: string;
  participantId: string;
  problemId: string;
  language: string;
}) {
  const statuses: SubmissionStatus[] = ["Accepted", "Wrong Answer", "Time Limit Exceeded"];
  const picked = statuses[Math.floor(Math.random() * statuses.length)];
  const score = picked === "Accepted" ? Math.floor(50 + Math.random() * 250) : 0;

  return withMockState((state) => {
    const submission: Submission = {
      id: id("sub"),
      contestId: payload.contestId,
      participantId: payload.participantId,
      problemId: payload.problemId,
      language: payload.language,
      status: picked,
      score,
      executionMs: Math.floor(20 + Math.random() * 2500),
      submittedAt: new Date().toISOString()
    };
    state.submissions.push(submission);
    return submission;
  });
}

export function mockRunCode() {
  const outputs = [
    "3\n",
    "12\n",
    "Runtime: 74ms | Memory: 12.1MB\n",
    "Compilation Success. Sample output => 7\n",
    "1 2 3 4\n"
  ];
  return outputs[Math.floor(Math.random() * outputs.length)];
}

export function resetMockState() {
  setMockState(cloneSeed());
}
