"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { PatientProfile } from "@/lib/models/PatientProfile";
import { signIn, signOut } from "@/auth";
import { audit } from "@/lib/audit";
import { rateLimit } from "@/lib/ratelimit";
import { RegisterSchema, LoginSchema } from "@/lib/schemas";
import { headers } from "next/headers";

export type FormState = {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

async function clientKey(prefix: string): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "anon";
  return `${prefix}:${ip}`;
}

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const rl = await rateLimit(await clientKey("register"), { limit: 5, windowMs: 60_000 });
  if (!rl.ok) return { error: "Too many attempts. Try again in a minute." };

  const parsed = RegisterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role") ?? "patient",
  });
  if (!parsed.success) {
    const tree = parsed.error.flatten();
    return { error: "Please fix the errors below.", fieldErrors: tree.fieldErrors };
  }

  // Doctors require manual licensure verification before they can sign in.
  const role = parsed.data.role;
  const status = role === "doctor" ? "pending" : "active";

  let user;
  try {
    await connectDB();
    const exists = await User.exists({ email: parsed.data.email });
    if (exists) return { error: "An account with that email already exists." };

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    user = await User.create({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role,
      status,
    });

    if (role === "patient") {
      await PatientProfile.create({ user: user._id });
    }

    await audit({
      actor: String(user._id),
      actorRole: role,
      action: "auth.register",
      target: `User:${user._id}`,
      meta: { role, status },
    });
  } catch (err) {
    console.error("[registerAction] DB write failed:", err);
    return {
      error:
        "We couldn't create your account right now. Please try again in a moment.",
    };
  }

  if (status !== "active") {
    redirect("/login?pending=1");
  }

  // Auto sign-in patients. In Auth.js v5 server actions, signIn must use
  // redirectTo so the framework sets the session cookie via the redirect
  // response. AuthError is thrown on credential failure; the success path
  // throws NEXT_REDIRECT which must propagate.
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/dashboard",
    });
    return { ok: true };
  } catch (err) {
    // NEXT_REDIRECT (success) must propagate — only AuthError is recoverable.
    if (err instanceof AuthError) {
      console.error("[registerAction] post-signIn AuthError:", err.type, err.message, err.cause);
      return { error: "Account created — please sign in." };
    }
    throw err;
  }
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const rl = await rateLimit(await clientKey("login"), { limit: 10, windowMs: 60_000 });
  if (!rl.ok) return { error: "Too many attempts. Try again in a minute." };

  const parsed = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "Email and password are required." };

  const callbackUrl = (formData.get("callbackUrl") as string) || "/dashboard";

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: callbackUrl,
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      // Log the underlying cause to server logs (Vercel runtime logs).
      // CredentialsSignin = bad email/password (authorize returned null).
      // CallbackRouteError = authorize threw — usually DB connectivity, env
      //   misconfig, or an unhandled exception inside `authorize`.
      console.error(
        "[loginAction] AuthError:",
        err.type,
        err.message,
        err.cause ?? "(no cause)",
      );
      switch (err.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        case "CallbackRouteError":
          return {
            error:
              "We couldn't reach the account service. The team has been notified — please try again in a moment.",
          };
        default:
          return { error: "Could not sign in. Please try again." };
      }
    }
    // NEXT_REDIRECT (success) must propagate.
    throw err;
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
