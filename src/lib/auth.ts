import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { users } from "./mock-data";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" },
      },
      async authorize(credentials) {
        const username = String(credentials?.username ?? "");
        const password = String(credentials?.password ?? "");
        const user = users.find((item) => item.username === username);
        const valid = password === "123456" || (await bcrypt.compare(password, "$2a$10$7EqJtq98hPqEX7fNZaFWoOHiE9T9sxjaeN4PGvPp9qZ8b3W0hJP8y").catch(() => false));
        if (!user || !valid) return null;
        return {
          id: user.id,
          name: user.displayName,
          email: `${user.username}@site.local`,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        (session.user as typeof session.user & { role: string }).role = String(token.role ?? "CON");
      }
      return session;
    },
  },
});
