"use client";

import { InfoCard } from "@/components/InfoCard";
import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { ContestResponse, fetchContestDetail } from "@/lib/apiClient";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function ContestViewPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [detail, setDetail] = useState<ContestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchContestDetail(id)
      .then(setDetail)
      .catch(() => setError("Contest not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const participantRequest = useMemo(
    () => detail?.joinRequests.find((request) => request.participantId === user?.id),
    [detail, user?.id]
  );

  if (loading) return <LoadingState label="Loading contest details..." />;
  if (error || !detail) return <div className="text-rose-400">{error || "No data"}</div>;

  const isOrganiser = user?.id === detail.contest.organiserId;

  if (isOrganiser) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-emerald-300">{detail.contest.name} · Organiser Dashboard</h1>

        <InfoCard title="Standings">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr>
                <th>Rank</th>
                <th>Participant</th>
                <th>Solved</th>
                <th>Score</th>
                <th>Penalty</th>
              </tr>
            </thead>
            <tbody>
              {detail.standings.map((row) => (
                <tr key={row.participantId} className="border-t border-slate-700">
                  <td>{row.rank}</td>
                  <td>{row.participantId}</td>
                  <td>{row.solved}</td>
                  <td>{row.score}</td>
                  <td>{row.penalty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </InfoCard>

        <InfoCard title="Lobby (Join Requests)">
          <ul className="space-y-2 text-sm">
            {detail.joinRequests.map((request) => (
              <li key={request.id} className="rounded bg-slate-900 p-2">
                {request.participant?.name ?? request.participantId} · status: {request.status} · requested at{" "}
                {new Date(request.requestedAt).toLocaleTimeString()}
              </li>
            ))}
            {detail.joinRequests.length === 0 && <li>No join requests.</li>}
          </ul>
        </InfoCard>

        <InfoCard title="Events (Submissions Feed)">
          <ul className="space-y-2 text-sm">
            {detail.events.map((event) => (
              <li key={event.id} className="rounded bg-slate-900 p-2">
                [{new Date(event.submittedAt).toLocaleTimeString()}] {event.participantId} → {event.problemId} · {event.status}
              </li>
            ))}
          </ul>
        </InfoCard>

        <InfoCard title="Problem Stats">
          <div className="grid gap-3 md:grid-cols-2">
            {detail.problemStats.map((stat) => (
              <div key={stat.problemId} className="rounded bg-slate-900 p-3 text-sm">
                <p className="font-medium">{stat.title}</p>
                <p>Tried by: {stat.triedBy}</p>
                <p>Solved by: {stat.solvedBy}</p>
                <p>Acceptance: {stat.acceptanceRate}%</p>
              </div>
            ))}
          </div>
        </InfoCard>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-emerald-300">{detail.contest.name} · Participant View</h1>
      {participantRequest?.status === "pending" && (
        <div className="rounded border border-amber-600 bg-amber-950 p-3">Waiting for host approval. Request is still pending.</div>
      )}

      <div className="rounded border border-slate-700 bg-slate-800 p-4">
        <p>Contest phase: {detail.phase}</p>
        {detail.phase === "upcoming" && <p>Countdown active. Start time: {new Date(detail.contest.startTime).toLocaleString()}</p>}
        {detail.phase !== "upcoming" && (
          <div className="mt-2 space-y-2">
            <p>Open any problem statement below:</p>
            {detail.problems.map((problem) => (
              <Link key={problem.id} href={`/contest/${detail.contest.id}/${problem.id}`} className="block rounded bg-slate-900 p-2">
                {problem.code} · {problem.title} ({problem.points} pts)
              </Link>
            ))}
          </div>
        )}
      </div>

      <InfoCard title="Your Standing Snapshot">
        <ul className="space-y-1 text-sm">
          {detail.standings.slice(0, 10).map((row) => (
            <li key={row.participantId} className={row.participantId === user?.id ? "text-emerald-200" : "text-slate-200"}>
              #{row.rank} {row.participantId} · score {row.score} · solved {row.solved}
            </li>
          ))}
        </ul>
      </InfoCard>
    </div>
  );
}
