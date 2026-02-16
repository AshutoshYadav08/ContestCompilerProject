"use client";

import { LoadingState } from "@/components/LoadingState";
import { fetchContestDetail } from "@/lib/apiClient";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const starter = `# Paste solution here\n\nprint('hello contest')`;

export default function ProblemPage() {
  const params = useParams<{ id: string; problemId: string }>();
  const [code, setCode] = useState(starter);
  const [detail, setDetail] = useState<Awaited<ReturnType<typeof fetchContestDetail>> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContestDetail(params.id)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [params.id]);

  const problem = useMemo(
    () => detail?.problems.find((candidate) => candidate.id === params.problemId),
    [detail, params.problemId]
  );

  if (loading) return <LoadingState label="Loading problem..." />;
  if (!problem) return <div className="text-rose-400">Problem not found in this contest.</div>;

  const publicTestCases = problem.testCases.filter((testCase) => !testCase.isHidden);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded border border-slate-700 bg-slate-800 p-4">
        <h1 className="text-xl font-semibold text-emerald-300">
          {problem.code} · {problem.title}
        </h1>
        <p className="mt-3 text-sm text-slate-200">{problem.statement}</p>
        <h2 className="mt-4 font-medium text-emerald-300">Constraints</h2>
        <ul className="list-inside list-disc text-sm text-slate-300">
          {problem.constraints.map((constraint) => (
            <li key={constraint}>{constraint}</li>
          ))}
        </ul>

        <h2 className="mt-4 font-medium text-emerald-300">Public Testcases</h2>
        <div className="space-y-2 text-sm">
          {publicTestCases.map((testCase) => (
            <div key={testCase.id} className="rounded bg-slate-900 p-2">
              <p>Input: {testCase.input}</p>
              <p>Output: {testCase.output}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded border border-slate-700 bg-slate-800 p-4">
        <h2 className="font-medium text-emerald-300">Monaco-like Editor (mock)</h2>
        <textarea
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="mt-2 h-72 w-full rounded border border-slate-600 bg-slate-900 p-3 font-mono text-sm"
        />
        <textarea placeholder="Custom input" className="mt-3 h-24 w-full rounded border border-slate-600 bg-slate-900 p-2 text-sm" />
        <div className="mt-3 flex gap-2">
          <button className="rounded bg-blue-700 px-4 py-2 hover:bg-blue-600">Run (Judge0 mock)</button>
          <button className="rounded bg-emerald-700 px-4 py-2 hover:bg-emerald-600">Submit (Judge0 mock)</button>
        </div>
      </section>
    </div>
  );
}
