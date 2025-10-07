import { authenticator } from "~/services/auth.server";
import type { Route } from "./+types/callback";
import { redirect } from "react-router";
import { commitSession, getSession } from "~/services/session.server";
import { ApiClient } from "~/services/ApiClient";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  let user = await authenticator.authenticate("cognito-auth", request);
  if (!user) {
    session.flash("error", "There was an error authenticating your request");
    return redirect("/", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
  session.set("user", user);

  const apiClient = new ApiClient(session, process.env.COGNITO_DOMAIN || "");

  const userResponse = await apiClient.request({
    method: "GET",
    url: "oauth2/userInfo",
  });

  user = { ...user, ...userResponse.data };

  session.set("user", user);

  return redirect("/dashboard", {
    headers: {
      "Set-Cookie": await apiClient.commit(),
    },
  });
}
