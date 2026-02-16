"use client";

import { useAuth } from "@/context/AuthContext";
import { fetchUsers } from "@/lib/apiClient";
import { User } from "@/types";
import { useEffect, useState } from "react";

export default function LoginTestPage() {
  const { user, loginById } = useAuth();
  const [value, setValue] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchUsers().then(setUsers).catch(() => setMessage("Could not load users"));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-emerald-300">/login-test</h1>
      <p className="text-slate-300">Input any sample user id to simulate auth without backend integration.</p>
      <div className="rounded border border-slate-700 bg-slate-800 p-4">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="e.g. org_1, p_4"
          className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2"
        />
        <button
          className="mt-3 rounded bg-emerald-700 px-4 py-2 hover:bg-emerald-600"
          onClick={async () => {
            const result = await loginById(value.trim());
            setMessage(result.ok ? "Logged in successfully" : result.message ?? "Login failed");
          }}
        >
          Login
        </button>
        {message && <p className="mt-2 text-sm text-slate-300">{message}</p>}
        <p className="mt-2 text-sm text-emerald-200">Current user: {user ? `${user.name} (${user.id})` : "none"}</p>
      </div>

      <div className="rounded border border-slate-700 bg-slate-800 p-4">
        <h2 className="text-lg font-medium text-emerald-300">Sample Users</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {users.map((sampleUser) => (
            <li key={sampleUser.id} className="rounded bg-slate-900 p-2">
              <p>{sampleUser.name}</p>
              <p className="text-slate-400">
                {sampleUser.id} · {sampleUser.role}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
