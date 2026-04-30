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

  await connectDB();
  const exists = await User.exists({ email: parsed.data.email });
  if (exists) return { error: "An account with that email already exists." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await User.create({
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

  if (status !== "active") {
    redirect("/login?pending=1");
  }

  // Auto sign-in patients. Per Auth.js v5: passing `redirectTo` makes signIn
  // convert AuthError into a redirect, swallowing form error state. Use
  // `redirect: false`, then redirect manually on success.
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { error: "Account created — please sign in." };
    }
    throw err;
  }
  redirect("/dashboard");
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
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      switch (err.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Could not sign in. Please try again." };
      }
    }
    throw err;
  }
  redirect(callbackUrl);
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}
