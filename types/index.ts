export type Role = "organiser" | "participant";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  rating: number;
  college?: string;
};

export type TestCase = {
  id: string;
  input: string;
  output: string;
  isHidden: boolean;
};

export type Problem = {
  id: string;
  code: string;
  title: string;
  statement: string;
  constraints: string[];
  points: number;
  tags: string[];
  testCases: TestCase[];
};

export type SubmissionStatus =
  | "Accepted"
  | "Wrong Answer"
  | "Time Limit Exceeded"
  | "Compilation Error"
  | "Runtime Error";

export type Submission = {
  id: string;
  contestId: string;
  problemId: string;
  participantId: string;
  language: string;
  status: SubmissionStatus;
  score: number;
  executionMs: number;
  submittedAt: string;
};

export type JoinRequest = {
  id: string;
  contestId: string;
  participantId: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
};

export type Contest = {
  id: string;
  name: string;
  description?: string;
  slug: string;
  organiserId: string;
  startTime: string;
  durationMinutes: number;
  visibility: "public" | "private";
  settings: {
    maxSubmissionsPerProblem: number;
    penaltyPerWrongMinutes: number;
    allowLateJoin: boolean;
    freezeLeaderboardLastMinutes: number;
  };
  problemIds: string[];
  participants: string[];
  joinRequestIds: string[];
};

export type StandingsRow = {
  participantId: string;
  solved: number;
  score: number;
  penalty: number;
  lastAcceptedAt?: string;
  rank: number;
};

export type ContestPhase = "upcoming" | "running" | "ended";
