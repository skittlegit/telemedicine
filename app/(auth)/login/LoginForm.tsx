"use client";

import { useActionState, useState } from "react";
import { loginAction, type FormState } from "@/app/actions/auth";
import { EyeIcon, EyeOffIcon } from "@/app/_components/icons";

const initial: FormState = {};

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  const [showPw, setShowPw] = useState(false);
  return (
    <form action={action} className="mt-8 space-y-5">
      <input type="hidden" name="callbackUrl" value={callbackUrl ?? "/dashboard"} />

      <div>
        <label className="eyebrow block mb-2" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="field"
          placeholder="you@example.com"
          aria-invalid={!!state.error}
          aria-describedby={state.error ? "login-error" : undefined}
        />
      </div>

      <div>
        <label className="eyebrow block mb-2" htmlFor="password">Password</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            required
            className="field w-full"
            style={{ paddingRight: "2.5rem" }}
            aria-invalid={!!state.error}
            aria-describedby={state.error ? "login-error" : undefined}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="absolute right-0 top-0 bottom-0 flex items-center px-3 text-ink-mute hover:text-ink"
          >
            {showPw
              ? <EyeOffIcon className="w-4 h-4" />
              : <EyeIcon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {state.error && (
        <div
          id="login-error"
          role="alert"
          className="alert-band"
          data-tone="oxblood"
        >
          <span>{state.error}</span>
        </div>
      )}

      <button type="submit" disabled={pending} className="btn btn-clay w-full justify-center">
        {pending ? "Signing in…" : "Sign in →"}
      </button>
    </form>
  );
}
