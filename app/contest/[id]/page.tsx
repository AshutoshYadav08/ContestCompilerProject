"use client";

import { InfoCard } from "@/components/InfoCard";
import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { ContestResponse, fetchContestDetail, reviewJoinRequest, sendJoinRequest } from "@/lib/apiClient";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function ContestViewPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [detail, setDetail] = useState<ContestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetchContestDetail(id);
      setDetail(response);
      setError("");
    } catch {
      setError("Contest not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 2000);
    const onUpdate = () => load();
    window.addEventListener("mock-db-updated", onUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("mock-db-updated", onUpdate);
    };
  }, [load]);

  const participantRequest = useMemo(
    () => detail?.joinRequests.find((request) => request.participantId === user?.id),
    [detail, user?.id]
  );

  const isOrganiser = user?.id === detail?.contest.organiserId;
  const isParticipantAllowed = detail?.contest.participants.includes(user?.id ?? "") ?? false;

  useEffect(() => {
    if (!user || user.role !== "participant" || !detail || isOrganiser) return;
    if (isParticipantAllowed || participantRequest) return;

    // Auto-create pending join request when participant opens /contest/:id from join input.
    // Replace this with backend POST /contest/:id/join in production.
    sendJoinRequest(detail.contest.id, user.id);
  }, [detail, isOrganiser, isParticipantAllowed, participantRequest, user]);

  if (loading) return <LoadingState label="Loading contest details..." />;
  if (error || !detail) return <div className="text-rose-400">{error || "No data"}</div>;

  if (isOrganiser) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-emerald-300">{detail.contest.name} · Organiser Dashboard</h1>

        <InfoCard title="Standings (Realtime)">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-400">
              <tr><th>Rank</th><th>Participant</th><th>Solved</th><th>Score</th><th>Penalty</th></tr>
            </thead>
            <tbody>
              {detail.standings.map((row) => (
                <tr key={row.participantId} className="border-t border-slate-700">
                  <td>{row.rank}</td><td>{row.participantId}</td><td>{row.solved}</td><td>{row.score}</td><td>{row.penalty}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </InfoCard>

        <InfoCard title="Lobby (Join Requests)">
          <ul className="space-y-2 text-sm">
            {detail.joinRequests.map((request) => (
              <li key={request.id} className="rounded bg-slate-900 p-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {request.participant?.name ?? request.participantId} · status: {request.status}
                  </span>
                  {request.status === "pending" && (
                    <span className="flex gap-2">
                      <button className="rounded bg-emerald-700 px-2 py-1" onClick={() => reviewJoinRequest(request.id, "approved")}>Approve</button>
                      <button className="rounded bg-rose-700 px-2 py-1" onClick={() => reviewJoinRequest(request.id, "rejected")}>Reject</button>
                    </span>
                  )}
                </div>
              </li>
            ))}
            {detail.joinRequests.length === 0 && <li>No join requests.</li>}
          </ul>
        </InfoCard>

        <InfoCard title="Events (Submissions Feed)">
          <ul className="space-y-2 text-sm">
            {detail.events.slice().reverse().map((event) => (
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
                <p className="font-medium">{stat.title}</p><p>Tried by: {stat.triedBy}</p><p>Solved by: {stat.solvedBy}</p><p>Acceptance: {stat.acceptanceRate}%</p>
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

      {!isParticipantAllowed && participantRequest?.status !== "approved" && (
        <div className="rounded border border-amber-600 bg-amber-950 p-3">
          <p>Waiting for host to let you in...</p>
          <p className="mt-2 text-xs text-amber-200">
            Your pending join request is created automatically when you open this contest via the join input on home page.
          </p>
        </div>
      )}

      {(isParticipantAllowed || participantRequest?.status === "approved") && (
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
      )}

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
