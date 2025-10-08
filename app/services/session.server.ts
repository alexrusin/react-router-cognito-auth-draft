import { createRedisSessionStorage } from "~/data/sessionStorage/createRedisSessionStorage";
import type { User } from "./auth.server";
import { createFileSessionStorage } from "@react-router/node";
import { createCookie, type SessionStorage } from "react-router";

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
let sessionStorage: SessionStorage<SessionData, SessionFlashData>;

if (process.env.SESSION_STORAGE === "redis") {
  sessionStorage = createRedisSessionStorage({
    host: "localhost",
    port: 6379,
    database: 0,
    cookie: sessionCookie,
    cookieOptions,
  });
} else {
  sessionStorage = createFileSessionStorage<SessionData, SessionFlashData>({
    dir: "./sessions",
    cookie: sessionCookie,
  });
}

const { getSession, commitSession, destroySession } = sessionStorage;

export { getSession, commitSession, destroySession };
