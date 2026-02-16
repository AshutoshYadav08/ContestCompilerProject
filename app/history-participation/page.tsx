"use client";

import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { fetchContestDetail, fetchContests } from "@/lib/apiClient";
import { Contest } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HistoryParticipationPage() {
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Record<string, { rank: number; score: number; penalty: number }>>({});

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchContests()
      .then(async (allContests) => {
        const participated = allContests.filter((contest) => contest.participants.includes(user.id));
        setContests(participated);

        const details = await Promise.all(participated.map((contest) => fetchContestDetail(contest.id)));
        const result: Record<string, { rank: number; score: number; penalty: number }> = {};

        details.forEach((detail) => {
          const me = detail.standings.find((entry) => entry.participantId === user.id);
          if (me) {
            result[detail.contest.id] = { rank: me.rank, score: me.score, penalty: me.penalty };
          }
        });

        setRows(result);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== "participant") {
    return <div className="rounded border border-amber-600 bg-amber-950 p-4">Login as participant to view participation history.</div>;
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-emerald-300">Participation History</h1>
      {contests.map((contest) => (
        <div key={contest.id} className="rounded border border-slate-700 bg-slate-800 p-4">
          <p className="text-lg font-medium">{contest.name}</p>
          <p className="text-sm text-slate-400">Start: {new Date(contest.startTime).toLocaleString()}</p>
          {rows[contest.id] ? (
            <p className="text-sm text-emerald-200">
              Rank #{rows[contest.id].rank} · Score {rows[contest.id].score} · Penalty {rows[contest.id].penalty}
            </p>
          ) : (
            <p className="text-sm text-slate-400">No scoreboard entry yet.</p>
          )}
          <Link href={`/contest/${contest.id}`} className="mt-2 inline-block rounded bg-slate-700 px-3 py-1">
            Open contest view
          </Link>
        </div>
      ))}
      {contests.length === 0 && <p>No participation found yet.</p>}
    </div>
  );
}
