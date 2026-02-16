import { contests, joinRequests, problems, submissions, users } from "@/lib/sampleData";
import { Contest, ContestPhase, Problem, StandingsRow, Submission } from "@/types";

export function getContestById(contestId: string): Contest | undefined {
  return contests.find((contest) => contest.id === contestId);
}

export function getContestProblems(contest: Contest): Problem[] {
  return contest.problemIds
    .map((problemId) => problems.find((problem) => problem.id === problemId))
    .filter((problem): problem is Problem => Boolean(problem));
}

export function getContestPhase(contest: Contest): ContestPhase {
  const now = Date.now();
  const start = new Date(contest.startTime).getTime();
  const end = start + contest.durationMinutes * 60 * 1000;

  if (now < start) {
    return "upcoming";
  }
  if (now >= start && now <= end) {
    return "running";
  }
  return "ended";
}

export function getContestSubmissions(contestId: string): Submission[] {
  return submissions
    .filter((submission) => submission.contestId === contestId)
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
}

export function getStandings(contest: Contest): StandingsRow[] {
  const contestSubmissions = getContestSubmissions(contest.id);

  const rows = contest.participants.map((participantId) => {
    const participantSubs = contestSubmissions.filter((submission) => submission.participantId === participantId);
    const acceptedProblemIds = new Set(
      participantSubs.filter((submission) => submission.status === "Accepted").map((submission) => submission.problemId)
    );

    const score = participantSubs.reduce((sum, current) => sum + current.score, 0);
    const wrongAttempts = participantSubs.filter((sub) => sub.status !== "Accepted").length;
    const penalty = wrongAttempts * contest.settings.penaltyPerWrongMinutes;
    const latestAccepted = participantSubs
      .filter((sub) => sub.status === "Accepted")
      .map((sub) => sub.submittedAt)
      .sort()
      .at(-1);

    return {
      participantId,
      solved: acceptedProblemIds.size,
      score,
      penalty,
      lastAcceptedAt: latestAccepted,
      rank: 0
    };
  });

  rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.penalty !== b.penalty) return a.penalty - b.penalty;
    return (a.lastAcceptedAt ?? "").localeCompare(b.lastAcceptedAt ?? "");
  });

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

export function getProblemStats(contest: Contest) {
  const contestSubs = getContestSubmissions(contest.id);

  return contest.problemIds.map((problemId) => {
    const problem = problems.find((candidate) => candidate.id === problemId);
    const problemSubs = contestSubs.filter((sub) => sub.problemId === problemId);
    const triedBy = new Set(problemSubs.map((sub) => sub.participantId)).size;
    const solvedBy = new Set(
      problemSubs.filter((sub) => sub.status === "Accepted").map((sub) => sub.participantId)
    ).size;

    return {
      problemId,
      title: problem?.title ?? problemId,
      triedBy,
      solvedBy,
      acceptanceRate: triedBy === 0 ? 0 : Number(((solvedBy / triedBy) * 100).toFixed(1))
    };
  });
}

export function getContestJoinRequests(contestId: string) {
  return joinRequests
    .filter((request) => request.contestId === contestId)
    .map((request) => ({
      ...request,
      participant: users.find((user) => user.id === request.participantId)
    }));
}
