"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-700 bg-slate-900/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-emerald-300">
          Contest Compiler
        </Link>
        <nav className="flex items-center gap-4 text-sm text-slate-200">
          <Link href="/history-participation">Participation History</Link>
          <Link href="/history-contests">Organiser History</Link>
          <Link href="/createcontest">Create Contest</Link>
          <Link href="/login-test">Login Test</Link>
          {user ? (
            <button onClick={logout} className="rounded bg-slate-700 px-3 py-1 hover:bg-slate-600">
              Logout ({user.id})
            </button>
          ) : (
            <span className="rounded bg-yellow-700 px-2 py-1 text-xs">Guest</span>
          )}
        </nav>
      </div>
    </header>
  );
}
