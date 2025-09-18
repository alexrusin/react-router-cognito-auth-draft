import { getSession } from "~/services/session.server";
import type { Route } from "./+types/admin";
import { data, redirect } from "react-router";
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

  if (response.data?.["custom:role"] !== "admin") {
    return redirect("/dashboard");
  }

  return data(response.data, {
    headers: {
      "Set-Cookie": await apiClient.commit(),
    },
  });
}
export default function Admin({ loaderData }: Route.ComponentProps) {
  const { name } = loaderData;
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{name}'s Admin Panel</h1>
      <p>Manage your application here.</p>
    </div>
  );
}
