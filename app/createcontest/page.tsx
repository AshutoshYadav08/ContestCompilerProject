"use client";

import { useAuth } from "@/context/AuthContext";
import { FormEvent, useState } from "react";

export default function CreateContestPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("Contest configuration captured locally (mock). Integrate POST API later.");
  };

  if (!user || user.role !== "organiser") {
    return (
      <div className="rounded border border-amber-600 bg-amber-950 p-4 text-amber-100">
        Only organiser users can access this page. Login with org_1 or org_2 in /login-test.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-emerald-300">Create Contest</h1>
      <form onSubmit={handleSubmit} className="grid gap-4 rounded border border-slate-700 bg-slate-800 p-5">
        <input className="rounded border border-slate-600 bg-slate-900 p-2" placeholder="Contest name" required />
        <textarea className="rounded border border-slate-600 bg-slate-900 p-2" placeholder="Contest description" rows={3} required />
        <input className="rounded border border-slate-600 bg-slate-900 p-2" type="datetime-local" required />
        <input className="rounded border border-slate-600 bg-slate-900 p-2" type="number" min={30} placeholder="Duration (minutes)" required />
        <textarea
          className="rounded border border-slate-600 bg-slate-900 p-2"
          placeholder="Problem statement(s), constraints, public/private testcase details"
          rows={5}
          required
        />
        <input className="rounded border border-slate-600 bg-slate-900 p-2" type="number" min={1} placeholder="Max submissions per problem" required />
        <input className="rounded border border-slate-600 bg-slate-900 p-2" type="number" min={0} placeholder="Penalty per wrong submission (minutes)" required />
        <button className="rounded bg-emerald-700 px-4 py-2 hover:bg-emerald-600" type="submit">
          Submit Contest
        </button>
      </form>
      {status && <p className="rounded border border-emerald-600 bg-emerald-950 p-3 text-emerald-200">{status}</p>}
    </div>
  );
}
