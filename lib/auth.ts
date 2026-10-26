import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || "distributeder-super-secret-demo-key-2026-xyz-392",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "User ID or Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both User ID/Email and password.");
        }

        const identifier = credentials.email.trim();

        // Search by email, exact user ID, name, or seller store slug
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier.toLowerCase() },
              { id: identifier },
              { name: { equals: identifier } },
              { sellerProfile: { storeSlug: identifier.toLowerCase() } },
            ],
          },
          include: { sellerProfile: true },
        });

        if (!user) {
          throw new Error("No account found matching this User ID or Email.");
        }

        if (user.isBanned) {
          throw new Error("This account has been suspended. Please contact platform support.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid password. Please check your credentials.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          isSeller: user.isSeller,
          activeMode: user.activeMode,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isSeller = user.isSeller;
        token.activeMode = user.activeMode;
      }

      // Handle session updates (e.g., switching modes or updating seller profile)
      if (trigger === "update" && session) {
        if (session.activeMode) token.activeMode = session.activeMode;
        if (session.isSeller !== undefined) token.isSeller = session.isSeller;
        if (session.name) token.name = session.name;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.isSeller = token.isSeller as boolean;
        session.user.activeMode = (token.activeMode as string) || "BUYER";
      }
      return session;
    },
  },
};

export const getServerAuthSession = () => getServerSession(authOptions);
