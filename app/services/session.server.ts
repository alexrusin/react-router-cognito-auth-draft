import { createCookie } from "react-router";
import type { User } from "./auth.server";
import { createFileSessionStorage } from "@react-router/node";

type SessionData = {
  user: User;
};

type SessionFlashData = {
  error: string;
};

const cookieOptions = {
  name: "__session",
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
  sameSite: "lax" as const,
  secrets: [process.env.APP_SECRET || ""],
  secure: process.env.NODE_ENV === "production",
};

const sessionCookie = createCookie(cookieOptions.name, cookieOptions);

const { getSession, commitSession, destroySession } = createFileSessionStorage<
  SessionData,
  SessionFlashData
>({
  dir: "./sessions",
  cookie: sessionCookie,
});

export { getSession, commitSession, destroySession };
