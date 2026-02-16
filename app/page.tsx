"use client";

import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { fetchContests, sendJoinRequest } from "@/lib/apiClient";
import { Contest } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [contests, setContests] = useState<Contest[]>([]);
  const [joinId, setJoinId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchContests().then(setContests).catch(() => setError("Failed to fetch contests"));
  }, []);

  const onJoin = async (event: FormEvent) => {
    event.preventDefault();
    if (!joinId.trim()) return;

    const found = contests.find((contest) => contest.id === joinId.trim());
    if (!found) {
      setError("Contest id not found. Use a valid id from list below.");
      return;
    }

    if (user?.role === "participant") {
      // Fake backend call: can be replaced later with POST /api/contests/:id/join-request
      await sendJoinRequest(found.id, user.id);
    }

    router.push(`/contest/${found.id}`);
  };

  if (loading) return <LoadingState label="Bootstrapping auth context..." />;

  return (
    <div className="space-y-6">
      <section className="rounded border border-slate-700 bg-slate-800 p-5">
        <h1 className="text-2xl font-semibold text-emerald-300">Realtime Contest Playground</h1>
        <p className="mt-2 text-slate-300">
          Logged in as: {user ? `${user.name} (${user.role})` : "Guest"}. Use <Link href="/login-test">/login-test</Link> to switch users.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/createcontest" className="rounded bg-emerald-700 px-4 py-2 text-white hover:bg-emerald-600">
            Create Contest
          </Link>
          <Link href="/history-participation" className="rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600">
            Participation History
          </Link>
          <Link href="/history-contests" className="rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600">
            Organiser History
          </Link>
        </div>
      </section>

      <section className="rounded border border-slate-700 bg-slate-800 p-5">
        <h2 className="text-lg font-semibold text-emerald-300">Join Contest</h2>
        <p className="mb-3 text-xs text-slate-400">
          Participant join flow: entering contest id creates a pending join request and redirects to waiting lobby at /contest/:id.
        </p>
        <form onSubmit={onJoin} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            value={joinId}
            onChange={(event) => setJoinId(event.target.value)}
            placeholder="Enter contest id e.g. contest_live_101"
            className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2"
          />
          <button type="submit" className="rounded bg-blue-700 px-4 py-2 hover:bg-blue-600">
            Join / Open
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
      </section>

      <section className="rounded border border-slate-700 bg-slate-800 p-5">
        <h2 className="text-lg font-semibold text-emerald-300">Sample Contest IDs</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-200">
          {contests.map((contest) => (
            <li key={contest.id} className="rounded bg-slate-900 p-2">
              <p className="font-medium">{contest.name}</p>
              <p className="text-slate-400">ID: {contest.id}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
