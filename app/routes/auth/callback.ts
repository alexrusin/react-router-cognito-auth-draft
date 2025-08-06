import { authenticator } from "~/services/auth.server";
import type { Route } from "./+types/callback";
import { redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  let user = await authenticator.authenticate("cognito-auth", request);
  console.log("user", user);
  if (user) {
    return redirect("/dashboard");
  }
  return "/";
}
