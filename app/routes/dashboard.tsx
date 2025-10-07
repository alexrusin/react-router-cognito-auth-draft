import { data } from "react-router";
import type { Route } from "./+types/dashboard";
import { userContext } from "~/context";
import { authMiddleware } from "~/middleware/authMiddleware";

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ context }: Route.LoaderArgs) {
  const userInfo = context.get(userContext);
  return data(userInfo);
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const userInfo = loaderData;
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to your dashboard, {userInfo?.name}! </p>
    </div>
  );
}
