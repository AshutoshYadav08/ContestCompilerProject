import { Contest, JoinRequest, Problem, Submission, User } from "@/types";

export const users: User[] = [
  { id: "org_1", name: "Aarav Sharma", email: "aarav@contest.dev", role: "organiser", rating: 1860 },
  { id: "org_2", name: "Mira Thomas", email: "mira@contest.dev", role: "organiser", rating: 1940 },
  { id: "p_1", name: "Ishaan Patel", email: "ishaan@uni.edu", role: "participant", rating: 1720, college: "NIT Surat" },
  { id: "p_2", name: "Riya Verma", email: "riya@uni.edu", role: "participant", rating: 1640, college: "IIT Guwahati" },
  { id: "p_3", name: "Kabir Das", email: "kabir@uni.edu", role: "participant", rating: 1510, college: "DTU" },
  { id: "p_4", name: "Ananya Roy", email: "ananya@uni.edu", role: "participant", rating: 1885, college: "BITS Pilani" },
  { id: "p_5", name: "Rohan Singh", email: "rohan@uni.edu", role: "participant", rating: 1435, college: "IIIT Hyderabad" },
  { id: "p_6", name: "Sara Khan", email: "sara@uni.edu", role: "participant", rating: 1682, college: "VIT" }
];

export const problems: Problem[] = [
  {
    id: "prob_1",
    code: "SUMPAIR",
    title: "Pair Sum Count",
    statement: "Given an array and target K, count pairs (i, j) where i < j and a[i] + a[j] = K.",
    constraints: ["1 <= n <= 2e5", "-1e9 <= a[i] <= 1e9", "-1e9 <= K <= 1e9"],
    points: 100,
    tags: ["hashmap", "arrays"],
    testCases: [
      { id: "t1", input: "5 6\n1 5 7 -1 5", output: "3", isHidden: false },
      { id: "t2", input: "4 4\n2 2 2 2", output: "6", isHidden: false },
      { id: "t3", input: "6 0\n-1 1 -2 2 0 0", output: "3", isHidden: true }
    ]
  },
  {
    id: "prob_2",
    code: "MINGRID",
    title: "Minimum Grid Path",
    statement: "Find minimum path sum from top-left to bottom-right moving right/down in grid.",
    constraints: ["1 <= n,m <= 200", "0 <= grid[i][j] <= 10^4"],
    points: 200,
    tags: ["dp", "grid"],
    testCases: [
      { id: "t4", input: "2 3\n1 2 3\n4 5 6", output: "12", isHidden: false },
      { id: "t5", input: "3 3\n1 3 1\n1 5 1\n4 2 1", output: "7", isHidden: false },
      { id: "t6", input: "1 1\n9", output: "9", isHidden: true }
    ]
  },
  {
    id: "prob_3",
    code: "KTHSTR",
    title: "K-th Lexicographic String",
    statement: "Given N and M, produce the K-th lexicographic binary string with N zeros and M ones.",
    constraints: ["1 <= N, M <= 50", "1 <= K <= 1e18"],
    points: 300,
    tags: ["combinatorics", "dp"],
    testCases: [
      { id: "t7", input: "2 2 4", output: "1001", isHidden: false },
      { id: "t8", input: "1 3 2", output: "1011", isHidden: true }
    ]
  },
  {
    id: "prob_4",
    code: "RANGEUPD",
    title: "Range Update Queries",
    statement: "Support range add and point query operations efficiently.",
    constraints: ["1 <= n,q <= 2e5"],
    points: 250,
    tags: ["fenwick", "segment-tree"],
    testCases: [
      { id: "t9", input: "5 3\nadd 1 3 2\nadd 2 5 3\nget 3", output: "5", isHidden: false },
      { id: "t10", input: "3 2\nadd 1 3 4\nget 2", output: "4", isHidden: true }
    ]
  }
];

export const contests: Contest[] = [
  {
    id: "contest_live_101",
    name: "Weekly Algo Arena 101",
    slug: "weekly-algo-arena-101",
    organiserId: "org_1",
    startTime: "2026-02-16T13:30:00.000Z",
    durationMinutes: 120,
    visibility: "public",
    settings: {
      maxSubmissionsPerProblem: 40,
      penaltyPerWrongMinutes: 10,
      allowLateJoin: true,
      freezeLeaderboardLastMinutes: 15
    },
    problemIds: ["prob_1", "prob_2", "prob_4"],
    participants: ["p_1", "p_2", "p_4", "p_6"],
    joinRequestIds: ["jr_1", "jr_2"]
  },
  // Visit /contest/contest_live_101 with organiser account org_1 to see running contest dashboard.
  {
    id: "contest_upcoming_202",
    name: "Dynamic Programming Sprint",
    slug: "dynamic-programming-sprint",
    organiserId: "org_2",
    startTime: "2026-02-16T17:00:00.000Z",
    durationMinutes: 90,
    visibility: "private",
    settings: {
      maxSubmissionsPerProblem: 25,
      penaltyPerWrongMinutes: 15,
      allowLateJoin: false,
      freezeLeaderboardLastMinutes: 0
    },
    problemIds: ["prob_2", "prob_3"],
    participants: ["p_3", "p_5"],
    joinRequestIds: ["jr_3", "jr_4"]
  },
  // Visit /contest/contest_upcoming_202 as participant p_1 to see waiting + join request flow.
  {
    id: "contest_ended_303",
    name: "January Mega Challenge",
    slug: "january-mega-challenge",
    organiserId: "org_1",
    startTime: "2026-01-10T10:00:00.000Z",
    durationMinutes: 180,
    visibility: "public",
    settings: {
      maxSubmissionsPerProblem: 60,
      penaltyPerWrongMinutes: 20,
      allowLateJoin: true,
      freezeLeaderboardLastMinutes: 30
    },
    problemIds: ["prob_1", "prob_2", "prob_3", "prob_4"],
    participants: ["p_1", "p_2", "p_3", "p_4", "p_5", "p_6"],
    joinRequestIds: []
  }
  // Visit /contest/contest_ended_303 as any participant for ended contest summary + problem links.
];

export const joinRequests: JoinRequest[] = [
  { id: "jr_1", contestId: "contest_live_101", participantId: "p_5", status: "pending", requestedAt: "2026-02-16T13:45:00.000Z" },
  { id: "jr_2", contestId: "contest_live_101", participantId: "p_3", status: "approved", requestedAt: "2026-02-16T13:25:00.000Z" },
  { id: "jr_3", contestId: "contest_upcoming_202", participantId: "p_1", status: "pending", requestedAt: "2026-02-16T14:05:00.000Z" },
  { id: "jr_4", contestId: "contest_upcoming_202", participantId: "p_6", status: "rejected", requestedAt: "2026-02-16T14:10:00.000Z" }
];

export const submissions: Submission[] = [
  { id: "s_1", contestId: "contest_live_101", problemId: "prob_1", participantId: "p_1", language: "cpp", status: "Wrong Answer", score: 0, executionMs: 25, submittedAt: "2026-02-16T13:40:00.000Z" },
  { id: "s_2", contestId: "contest_live_101", problemId: "prob_1", participantId: "p_1", language: "cpp", status: "Accepted", score: 100, executionMs: 18, submittedAt: "2026-02-16T13:48:00.000Z" },
  { id: "s_3", contestId: "contest_live_101", problemId: "prob_2", participantId: "p_2", language: "python", status: "Time Limit Exceeded", score: 0, executionMs: 2000, submittedAt: "2026-02-16T13:52:00.000Z" },
  { id: "s_4", contestId: "contest_live_101", problemId: "prob_2", participantId: "p_4", language: "java", status: "Accepted", score: 200, executionMs: 220, submittedAt: "2026-02-16T14:05:00.000Z" },
  { id: "s_5", contestId: "contest_live_101", problemId: "prob_4", participantId: "p_6", language: "cpp", status: "Compilation Error", score: 0, executionMs: 0, submittedAt: "2026-02-16T14:10:00.000Z" },
  { id: "s_6", contestId: "contest_live_101", problemId: "prob_4", participantId: "p_6", language: "cpp", status: "Accepted", score: 250, executionMs: 67, submittedAt: "2026-02-16T14:21:00.000Z" },

  { id: "s_7", contestId: "contest_ended_303", problemId: "prob_1", participantId: "p_2", language: "python", status: "Accepted", score: 100, executionMs: 22, submittedAt: "2026-01-10T10:15:00.000Z" },
  { id: "s_8", contestId: "contest_ended_303", problemId: "prob_2", participantId: "p_2", language: "python", status: "Accepted", score: 200, executionMs: 100, submittedAt: "2026-01-10T10:55:00.000Z" },
  { id: "s_9", contestId: "contest_ended_303", problemId: "prob_3", participantId: "p_4", language: "cpp", status: "Accepted", score: 300, executionMs: 40, submittedAt: "2026-01-10T11:50:00.000Z" },
  { id: "s_10", contestId: "contest_ended_303", problemId: "prob_4", participantId: "p_1", language: "cpp", status: "Wrong Answer", score: 0, executionMs: 55, submittedAt: "2026-01-10T11:58:00.000Z" },
  { id: "s_11", contestId: "contest_ended_303", problemId: "prob_4", participantId: "p_1", language: "cpp", status: "Accepted", score: 250, executionMs: 45, submittedAt: "2026-01-10T12:07:00.000Z" },
  { id: "s_12", contestId: "contest_ended_303", problemId: "prob_1", participantId: "p_3", language: "java", status: "Runtime Error", score: 0, executionMs: 0, submittedAt: "2026-01-10T10:40:00.000Z" }
];
