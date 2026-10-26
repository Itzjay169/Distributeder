import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isSeller: boolean;
      activeMode: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: string;
    isSeller: boolean;
    activeMode: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    isSeller: boolean;
    activeMode: string;
  }
}
