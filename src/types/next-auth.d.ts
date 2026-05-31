import type { DefaultSession } from "next-auth";
import type { ProjectRole } from "./enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: ProjectRole;
    } & DefaultSession["user"];
  }

  interface User {
    role?: ProjectRole;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: ProjectRole;
  }
}

