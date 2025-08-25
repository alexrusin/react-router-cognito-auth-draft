import { data, Form, redirect, type ActionFunctionArgs } from "react-router";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";
import { authenticator } from "~/services/auth.server";
import type { Route } from "./+types";
import { getSession } from "~/services/session.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  if (session.has("user")) {
    return redirect("/dashboard");
  }
  return data({ error: session.get("error") });
}

export async function action({ request }: ActionFunctionArgs) {
  return await authenticator.authenticate("cognito-auth", request);
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { error } = loaderData;
  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center min-h-0">
        <header className="flex flex-col items-center gap-9">
          <div className="w-[500px] max-w-[100vw] p-4">
            <img
              src={logoLight}
              alt="React Router"
              className="block w-full dark:hidden"
            />
            <img
              src={logoDark}
              alt="React Router"
              className="hidden w-full dark:block"
            />
          </div>
        </header>
        <div className="max-w-[300px] w-full space-y-6 px-4">
          <h1 className="text-4xl font-bold mb-6">Authentication</h1>
          <Form method="post">
            <button
              type="submit"
              className="px-6 py-3 text-xl font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Get Started
            </button>
            {error ? (
              <div className="error mt-4 text-red-500">{error}</div>
            ) : null}
          </Form>
        </div>
      </div>
    </main>
  );
}
