"use client";

import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/context/AuthContext";
import { fetchContestDetail, runCode, submitCode } from "@/lib/apiClient";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const starter = `# Paste solution here\n\nprint('hello contest')`;

export default function ProblemPage() {
  const params = useParams<{ id: string; problemId: string }>();
  const { user } = useAuth();
  const [code, setCode] = useState(starter);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchContestDetail>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [output, setOutput] = useState("Run output will appear here...");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const response = await fetchContestDetail(params.id);
    setDetail(response);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 2000);
    const onUpdate = () => load();
    window.addEventListener("mock-db-updated", onUpdate);
    return () => {
      clearInterval(interval);
      window.removeEventListener("mock-db-updated", onUpdate);
    };
  }, [params.id]);

  const problem = useMemo(() => detail?.problems.find((candidate) => candidate.id === params.problemId), [detail, params.problemId]);

  if (loading) return <LoadingState label="Loading problem..." />;
  if (!problem || !detail) return <div className="text-rose-400">Problem not found in this contest.</div>;

  const publicTestCases = problem.testCases.filter((testCase) => !testCase.isHidden);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded border border-slate-700 bg-slate-800 p-4">
        <h1 className="text-xl font-semibold text-emerald-300">{problem.code} · {problem.title}</h1>
        <p className="mt-3 text-sm text-slate-200">{problem.statement}</p>
        <h2 className="mt-4 font-medium text-emerald-300">Constraints</h2>
        <ul className="list-inside list-disc text-sm text-slate-300">
          {problem.constraints.map((constraint) => <li key={constraint}>{constraint}</li>)}
        </ul>

        <h2 className="mt-4 font-medium text-emerald-300">Public Testcases</h2>
        <div className="space-y-2 text-sm">
          {publicTestCases.map((testCase) => (
            <div key={testCase.id} className="rounded bg-slate-900 p-2"><p>Input: {testCase.input}</p><p>Output: {testCase.output}</p></div>
          ))}
        </div>
      </section>

      <section className="rounded border border-slate-700 bg-slate-800 p-4">
        <h2 className="font-medium text-emerald-300">Monaco-like Editor (Realtime Mock)</h2>
        <textarea value={code} onChange={(event) => setCode(event.target.value)} className="mt-2 h-72 w-full rounded border border-slate-600 bg-slate-900 p-3 font-mono text-sm" />
        <textarea placeholder="Custom input" className="mt-3 h-24 w-full rounded border border-slate-600 bg-slate-900 p-2 text-sm" />
        <div className="mt-3 flex gap-2">
          <button
            className="rounded bg-blue-700 px-4 py-2 hover:bg-blue-600"
            onClick={async () => {
              const result = await runCode();
              setOutput(`Status: ${result.status.description}\n\n${result.stdout}`);
            }}
          >
            Run (Judge0-style mock)
          </button>
          <button
            disabled={submitting || !user}
            className="rounded bg-emerald-700 px-4 py-2 hover:bg-emerald-600 disabled:opacity-50"
            onClick={async () => {
              if (!user) return;
              setSubmitting(true);
              const submission = await submitCode({
                contestId: detail.contest.id,
                participantId: user.id,
                problemId: problem.id,
                language: "python"
              });
              setOutput(`Submission: ${submission.status} | Score: ${submission.score} | Runtime: ${submission.executionMs}ms`);
              setSubmitting(false);
            }}
          >
            {submitting ? "Submitting..." : "Submit (Random verdict)"}
          </button>
        </div>

        <pre className="mt-3 whitespace-pre-wrap rounded bg-black/40 p-3 text-xs text-emerald-100">{output}</pre>
        <p className="mt-2 text-xs text-slate-400">Mock API call is isolated in lib/apiClient.ts and can be swapped with real backend fetch later.</p>
      </section>
    </div>
  );
}
