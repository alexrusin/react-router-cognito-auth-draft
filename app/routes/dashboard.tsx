import { data, redirect } from "react-router";
import { getSession } from "~/services/session.server";
import type { Route } from "./+types/dashboard";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");
  if (!user) {
    return redirect("/");
  }
  return data({ user });
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard {user.name}! </p>
    </div>
  );
}
