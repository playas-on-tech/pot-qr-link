"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="card w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-6">Admin login</h1>
        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              className="input w-full"
            />
          </div>
          {state?.error && <p className="text-red-500 text-sm">{state.error}</p>}
          <button type="submit" disabled={pending} className="btn-primary w-full">
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
