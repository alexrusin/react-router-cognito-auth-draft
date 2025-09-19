import { destroySession, getSession } from "~/services/session.server";
import type { Route } from "./+types/callback";
import { redirect } from "react-router";
import { authenticator, type User } from "~/services/auth.server";
import type { OAuth2Strategy } from "remix-auth-oauth2";

export async function action({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");
  if (user) {
    const strategy: OAuth2Strategy<User> | null =
      authenticator.get("cognito-auth");
    if (strategy) {
      await strategy.revokeToken(user.refreshToken);
    }
  }

  const logoutUrl = `${process.env.COGNITO_DOMAIN}/logout?client_id=${process.env.COGNITO_CLIENT_ID}&logout_uri=${encodeURIComponent(
    `${process.env.APP_URL}/auth/logout`,
  )}`;
  return redirect(logoutUrl);
}

export async function loader({ request }: Route.ActionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
}
