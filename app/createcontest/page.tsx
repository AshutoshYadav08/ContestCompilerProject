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

type CreateTab = "contest" | "problems";

export default function CreateContestPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<CreateTab>("contest");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(90);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [penaltyPerWrongMinutes, setPenaltyPerWrongMinutes] = useState(10);
  const [maxSubmissionsPerProblem, setMaxSubmissionsPerProblem] = useState(40);
  const [allowLateJoin, setAllowLateJoin] = useState(true);
  const [freezeLeaderboardLastMinutes, setFreezeLeaderboardLastMinutes] = useState(15);
  const [problems, setProblems] = useState<ProblemDraft[]>([blankProblem(), blankProblem()]);
  const [saving, setSaving] = useState(false);

  const updateProblem = (index: number, field: keyof ProblemDraft, value: string | number) => {
    setProblems((prev) => prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry)));
  };

  const canSubmit = useMemo(
    () =>
      Boolean(name.trim()) &&
      Boolean(startTime) &&
      problems.length > 0 &&
      problems.every((problem) => problem.title.trim() && problem.code.trim() && problem.statement.trim()),
    [name, startTime, problems]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
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

    router.push(`/contest/${contestId}`);
  };

  if (!user || user.role !== "organiser") {
    return <div className="rounded border border-amber-600 bg-amber-950 p-4">Only organiser users can access this page.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-emerald-300">Create Contest (Realtime Mock)</h1>
      <p className="text-sm text-slate-300">
        Two-step flow: configure contest details, then add problems. On <b>Start Contest</b>, data is saved into temporary localStorage DB and you are redirected to <code>/contest/:id</code>.
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("contest")}
          className={`rounded px-3 py-2 text-sm ${activeTab === "contest" ? "bg-emerald-700" : "bg-slate-700"}`}
        >
          Contest Details
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("problems")}
          className={`rounded px-3 py-2 text-sm ${activeTab === "problems" ? "bg-emerald-700" : "bg-slate-700"}`}
        >
          Add Problems
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded border border-slate-700 bg-slate-800 p-5">
        {activeTab === "contest" && (
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input value={name} onChange={(e) => setName(e.target.value)} className="rounded border border-slate-600 bg-slate-900 p-2" placeholder="Contest name" required />
              <input value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded border border-slate-600 bg-slate-900 p-2" type="datetime-local" required />
              <input value={durationMinutes} onChange={(e) => setDurationMinutes(Number(e.target.value))} className="rounded border border-slate-600 bg-slate-900 p-2" type="number" min={30} placeholder="Duration" required />
              <select value={visibility} onChange={(e) => setVisibility(e.target.value as "public" | "private")} className="rounded border border-slate-600 bg-slate-900 p-2">
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
              <input value={maxSubmissionsPerProblem} onChange={(e) => setMaxSubmissionsPerProblem(Number(e.target.value))} className="rounded border border-slate-600 bg-slate-900 p-2" type="number" min={1} placeholder="Max submissions" required />
              <input value={penaltyPerWrongMinutes} onChange={(e) => setPenaltyPerWrongMinutes(Number(e.target.value))} className="rounded border border-slate-600 bg-slate-900 p-2" type="number" min={0} placeholder="Penalty" required />
              <input value={freezeLeaderboardLastMinutes} onChange={(e) => setFreezeLeaderboardLastMinutes(Number(e.target.value))} className="rounded border border-slate-600 bg-slate-900 p-2" type="number" min={0} placeholder="Freeze leaderboard" required />
              <label className="flex items-center gap-2 rounded border border-slate-600 bg-slate-900 p-2">
                <input type="checkbox" checked={allowLateJoin} onChange={(e) => setAllowLateJoin(e.target.checked)} /> Allow late join
              </label>
            </div>

            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded border border-slate-600 bg-slate-900 p-2" placeholder="Contest description and settings" rows={4} required />

            <button type="button" onClick={() => setActiveTab("problems")} className="rounded bg-blue-700 px-4 py-2">
              Next: Add Problems
            </button>
          </div>
        )}

        {activeTab === "problems" && (
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
                    <button type="button" className="rounded bg-rose-700 px-2 py-1 text-xs" onClick={() => setProblems((prev) => prev.filter((_, i) => i !== index))}>
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

            <div className="flex gap-2">
              <button type="button" onClick={() => setActiveTab("contest")} className="rounded bg-slate-700 px-4 py-2">
                Back to Contest Details
              </button>
              <button disabled={saving || !canSubmit} className="rounded bg-emerald-700 px-4 py-2 hover:bg-emerald-600 disabled:opacity-50" type="submit">
                {saving ? "Starting..." : "Start Contest"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
