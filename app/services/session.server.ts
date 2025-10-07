import type { User } from "./auth.server";
import { createFileSessionStorage } from "@react-router/node";

type SessionData = {
  user: User;
};

type SessionFlashData = {
  error: string;
};

const { getSession, commitSession, destroySession } = createFileSessionStorage<
  SessionData,
  SessionFlashData
>({
  dir: "./sessions",
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.APP_SECRET || ""],
    secure: process.env.NODE_ENV === "production",
  },
});

export { getSession, commitSession, destroySession };
