"use client";

import { useAuth } from "@/context/AuthContext";
import { createContest } from "@/lib/apiClient";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

type ProblemDraft = {
  title: string;
  code: string;
  statement: string;
  constraints: string;
  points: number;
  sampleInput: string;
  sampleOutput: string;
};

const blankProblem = (): ProblemDraft => ({
  title: "",
  code: "",
  statement: "",
  constraints: "1 <= n <= 2e5",
  points: 100,
  sampleInput: "",
  sampleOutput: ""
});

export default function CreateContestPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<"contest" | "problems">("contest");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [penaltyPerWrongMinutes, setPenaltyPerWrongMinutes] = useState(10);
  const [maxSubmissionsPerProblem, setMaxSubmissionsPerProblem] = useState(40);
  const [allowLateJoin, setAllowLateJoin] = useState(true);
  const [freezeLeaderboardLastMinutes, setFreezeLeaderboardLastMinutes] = useState(15);
  const [problems, setProblems] = useState<ProblemDraft[]>([blankProblem()]);
  const [saving, setSaving] = useState(false);

  const updateProblem = (index: number, field: keyof ProblemDraft, value: string | number) => {
    setProblems((prev) => prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)));
  };

  const canSubmit = useMemo(() => {
    return (
      name.trim().length > 2 &&
      Boolean(startTime) &&
      problems.length > 0 &&
      problems.every((problem) =>
        [
          problem.title,
          problem.code,
          problem.statement,
          problem.constraints,
          problem.sampleInput,
          problem.sampleOutput
        ].every((value) => value.trim().length > 0)
      )
    );
  }, [name, startTime, problems]);

  const handleStartContest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !canSubmit) return;

    setSaving(true);
    try {
      const contestId = await createContest({
        organiserId: user.id,
        name,
        description,
        startTime: new Date(startTime).toISOString(),
        durationMinutes,
        visibility,
        penaltyPerWrongMinutes,
        maxSubmissionsPerProblem,
        allowLateJoin,
        freezeLeaderboardLastMinutes,
        problems
      });

      // Backend swap note: keep this redirect shape and replace createContest() with POST /api/contests.
      router.push(`/contest/${contestId}`);
    } finally {
      setSaving(false);
    }
  };

  if (!user || user.role !== "organiser") {
    return <div className="rounded border border-amber-600 bg-amber-950 p-4">Only organiser users can access this page.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-emerald-300">Create Contest</h1>
      <p className="text-sm text-slate-300">
        Frontend-only realtime mode: this form saves contest + problems to temporary localStorage DB and can be replaced with real backend APIs later.
      </p>

      <form onSubmit={handleStartContest} className="space-y-4 rounded border border-slate-700 bg-slate-800 p-5">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("contest")}
            className={`rounded px-3 py-2 text-sm ${tab === "contest" ? "bg-emerald-700 text-white" : "bg-slate-700 text-slate-200"}`}
          >
            Contest Details
          </button>
          <button
            type="button"
            onClick={() => setTab("problems")}
            className={`rounded px-3 py-2 text-sm ${tab === "problems" ? "bg-emerald-700 text-white" : "bg-slate-700 text-slate-200"}`}
          >
            Problems ({problems.length})
          </button>
        </div>

        {tab === "contest" && (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={name} onChange={(e) => setName(e.target.value)} className="rounded border border-slate-600 bg-slate-900 p-2" placeholder="Contest name" required />
              <input value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded border border-slate-600 bg-slate-900 p-2" type="datetime-local" required />
              <input value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="rounded border border-slate-600 bg-slate-900 p-2" type="number" min={30} placeholder="Duration (minutes)" required />
              <select value={visibility} onChange={(e) => setVisibility(e.target.value as "public" | "private")} className="rounded border border-slate-600 bg-slate-900 p-2">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <input value={maxSubmissionsPerProblem} onChange={(e) => setMaxSubmissionsPerProblem(Number(e.target.value))} className="rounded border border-slate-600 bg-slate-900 p-2" type="number" min={1} placeholder="Max submissions/problem" required />
              <input value={penaltyPerWrongMinutes} onChange={(e) => setPenaltyPerWrongMinutes(Number(e.target.value))} className="rounded border border-slate-600 bg-slate-900 p-2" type="number" min={0} placeholder="Penalty per wrong (minutes)" required />
              <input value={freezeLeaderboardLastMinutes} onChange={(e) => setFreezeLeaderboardLastMinutes(Number(e.target.value))} className="rounded border border-slate-600 bg-slate-900 p-2" type="number" min={0} placeholder="Leaderboard freeze last (minutes)" required />
              <label className="flex items-center gap-2 rounded border border-slate-600 bg-slate-900 p-2 text-sm">
                <input type="checkbox" checked={allowLateJoin} onChange={(e) => setAllowLateJoin(e.target.checked)} />
                Allow late join
              </label>
            </div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded border border-slate-600 bg-slate-900 p-2" placeholder="Contest description, rules, and notes" rows={4} required />
          </div>
        )}

        {tab === "problems" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-emerald-300">Problem Schema Input</h2>
              <button type="button" className="rounded bg-slate-700 px-3 py-1" onClick={() => setProblems((prev) => [...prev, blankProblem()])}>
                + Add Problem
              </button>
            </div>

            {problems.map((problem, index) => (
              <div key={index} className="space-y-2 rounded border border-slate-600 bg-slate-900/40 p-3">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Problem {index + 1}</p>
                  {problems.length > 1 && (
                    <button
                      type="button"
                      className="rounded bg-rose-700 px-2 py-1 text-xs"
                      onClick={() => setProblems((prev) => prev.filter((_, i) => i !== index))}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid gap-2 md:grid-cols-3">
                  <input value={problem.title} onChange={(e) => updateProblem(index, "title", e.target.value)} className="rounded border border-slate-600 bg-slate-900 p-2" placeholder="Title" required />
                  <input value={problem.code} onChange={(e) => updateProblem(index, "code", e.target.value.toUpperCase())} className="rounded border border-slate-600 bg-slate-900 p-2" placeholder="Code (SUMPAIR)" required />
                  <input value={problem.points} onChange={(e) => updateProblem(index, "points", Number(e.target.value))} className="rounded border border-slate-600 bg-slate-900 p-2" type="number" min={50} step={50} placeholder="Points" required />
                </div>

                <textarea value={problem.statement} onChange={(e) => updateProblem(index, "statement", e.target.value)} className="w-full rounded border border-slate-600 bg-slate-900 p-2" placeholder="Problem description / statement" rows={3} required />
                <textarea value={problem.constraints} onChange={(e) => updateProblem(index, "constraints", e.target.value)} className="w-full rounded border border-slate-600 bg-slate-900 p-2" placeholder="Constraints (one per line)" rows={2} required />

                <div className="grid gap-2 md:grid-cols-2">
                  <textarea value={problem.sampleInput} onChange={(e) => updateProblem(index, "sampleInput", e.target.value)} className="rounded border border-slate-600 bg-slate-900 p-2" placeholder="Sample testcase input" rows={2} required />
                  <textarea value={problem.sampleOutput} onChange={(e) => updateProblem(index, "sampleOutput", e.target.value)} className="rounded border border-slate-600 bg-slate-900 p-2" placeholder="Sample testcase output" rows={2} required />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded border border-slate-700 bg-slate-900/70 p-3 text-xs text-slate-300">
          On <strong>Start Contest</strong>, we create a temporary contest in localStorage and redirect to <strong>/contest/:id</strong>. From there you can open problem links at <strong>/contest/:id/:problemId</strong>.
        </div>

        <button disabled={saving || !canSubmit} className="rounded bg-emerald-700 px-4 py-2 hover:bg-emerald-600 disabled:opacity-50" type="submit">
          {saving ? "Starting Contest..." : "Start Contest"}
        </button>
      </form>
    </div>
  );
}
