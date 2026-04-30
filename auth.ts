import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { User, type Role } from "@/lib/models/User";
import { LoginSchema } from "@/lib/schemas";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
  interface User {
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
    role?: Role;
  }
}

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8h
  pages: { signIn: "/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = LoginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const { email, password } = parsed.data;
        await connectDB();
        const user = await User.findOne({ email })
          .select("+passwordHash name email role status image")
          .lean<{
            _id: Types.ObjectId;
            name: string;
            email: string;
            role: Role;
            status: string;
            image?: string;
            passwordHash: string;
          } | null>();
        if (!user) return null;
        if (user.status !== "active") return null;
        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;
        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          image: user.image ?? null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = (user as { id: string }).id;
        token.role = (user as { role: Role }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.role) session.user.role = token.role;
      return session;
    },
    authorized({ auth: a }) {
      // Used by `proxy.ts` middleware integration if desired.
      return !!a?.user;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
