import { data, redirect } from "react-router";
import { getSession } from "~/services/session.server";
import type { Route } from "./+types/dashboard";
import { ApiClient } from "~/services/ApiClient";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    return redirect("/");
  }

  const apiClient = new ApiClient(session, process.env.COGNITO_DOMAIN || "");

  const response = await apiClient.request({
    method: "GET",
    url: "oauth2/userInfo",
  });

  return data(response.data, {
    headers: {
      "Set-Cookie": await apiClient.commit(),
    },
  });
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { name } = loaderData;
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard, {name}! </p>
    </div>
  );
}
