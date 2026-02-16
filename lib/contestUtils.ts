import { Contest, ContestPhase, JoinRequest, Problem, StandingsRow, Submission, User } from "@/types";

export function getContestById(contests: Contest[], contestId: string): Contest | undefined {
  return contests.find((contest) => contest.id === contestId);
}

export function getContestProblems(allProblems: Problem[], contest: Contest): Problem[] {
  return contest.problemIds
    .map((problemId) => allProblems.find((problem) => problem.id === problemId))
    .filter((problem): problem is Problem => Boolean(problem));
}

export function getContestPhase(contest: Contest): ContestPhase {
  const now = Date.now();
  const start = new Date(contest.startTime).getTime();
  const end = start + contest.durationMinutes * 60 * 1000;

  if (now < start) return "upcoming";
  if (now <= end) return "running";
  return "ended";
}

export function getContestSubmissions(allSubmissions: Submission[], contestId: string): Submission[] {
  return allSubmissions
    .filter((submission) => submission.contestId === contestId)
    .sort((a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime());
}

export function getStandings(contest: Contest, allSubmissions: Submission[]): StandingsRow[] {
  const contestSubmissions = getContestSubmissions(allSubmissions, contest.id);

  const rows = contest.participants.map((participantId) => {
    const participantSubs = contestSubmissions.filter((submission) => submission.participantId === participantId);
    const acceptedProblemIds = new Set(
      participantSubs.filter((submission) => submission.status === "Accepted").map((submission) => submission.problemId)
    );
    const score = participantSubs.reduce((sum, current) => sum + current.score, 0);
    const wrongAttempts = participantSubs.filter((sub) => sub.status !== "Accepted").length;

    return {
      participantId,
      solved: acceptedProblemIds.size,
      score,
      penalty: wrongAttempts * contest.settings.penaltyPerWrongMinutes,
      lastAcceptedAt: participantSubs.filter((sub) => sub.status === "Accepted").map((sub) => sub.submittedAt).sort().at(-1),
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

export function getProblemStats(contest: Contest, allProblems: Problem[], allSubmissions: Submission[]) {
  const contestSubs = getContestSubmissions(allSubmissions, contest.id);

  return contest.problemIds.map((problemId) => {
    const problem = allProblems.find((candidate) => candidate.id === problemId);
    const problemSubs = contestSubs.filter((sub) => sub.problemId === problemId);
    const triedBy = new Set(problemSubs.map((sub) => sub.participantId)).size;
    const solvedBy = new Set(problemSubs.filter((sub) => sub.status === "Accepted").map((sub) => sub.participantId)).size;

    return {
      problemId,
      title: problem?.title ?? problemId,
      triedBy,
      solvedBy,
      acceptanceRate: triedBy === 0 ? 0 : Number(((solvedBy / triedBy) * 100).toFixed(1))
    };
  });
}

export function getContestJoinRequests(contestId: string, requests: JoinRequest[], users: User[]) {
  return requests
    .filter((request) => request.contestId === contestId)
    .map((request) => ({ ...request, participant: users.find((user) => user.id === request.participantId) }));
}
