import { getSession } from "~/services/session.server";
import type { Route } from "./+types/admin";
import { data, redirect } from "react-router";

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");
  if (!user) {
    return redirect("/");
  }
  if (!user.admin) {
    return redirect("/dashboard");
  }
  return data({ user });
}
export default function Admin({ loaderData }: Route.ComponentProps) {
  const { user } = loaderData;
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{user.name}'s Admin Panel</h1>
      <p>Manage your application here.</p>
    </div>
  );
}
