import { createCookieSessionStorage } from "react-router";

// Create a session storage
export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.APP_SECRET || ""],
    secure: process.env.NODE_ENV === "production",
  },
});
