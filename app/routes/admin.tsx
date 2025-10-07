import type { Route } from "./+types/admin";
import { data, redirect } from "react-router";
import { userContext } from "~/context";
import { authMiddleware } from "~/middleware/authMiddleware";

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const userInfo = context.get(userContext);
  if (userInfo?.["custom:role"] !== "admin") {
    return redirect("/dashboard");
  }
  return data(userInfo);
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
