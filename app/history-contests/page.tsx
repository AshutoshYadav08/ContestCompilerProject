"use client";

import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { fetchContests } from "@/lib/apiClient";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Contest } from "@/types";

export default function HistoryContestsPage() {
  const { user } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContests()
      .then(setContests)
      .finally(() => setLoading(false));
  }, []);

  const organiserContests = useMemo(() => contests.filter((contest) => contest.organiserId === user?.id), [contests, user?.id]);

  if (!user || user.role !== "organiser") {
    return <div className="rounded border border-amber-600 bg-amber-950 p-4">Login as organiser to view organiser contest history.</div>;
  }

  if (loading) return <LoadingState />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-emerald-300">Organiser Contest History</h1>
      {organiserContests.map((contest) => (
        <div key={contest.id} className="rounded border border-slate-700 bg-slate-800 p-4">
          <p className="text-lg font-medium">{contest.name}</p>
          <p className="text-sm text-slate-400">Start: {new Date(contest.startTime).toLocaleString()}</p>
          <p className="text-sm text-slate-400">Participants: {contest.participants.length}</p>
          <Link href={`/contest/${contest.id}`} className="mt-2 inline-block rounded bg-slate-700 px-3 py-1">
            Open organiser dashboard
          </Link>
        </div>
      ))}
      {organiserContests.length === 0 && <p>No contests found for your organiser account.</p>}
    </div>
  );
}
