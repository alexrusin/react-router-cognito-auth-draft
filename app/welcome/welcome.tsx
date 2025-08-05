import { Link } from "react-router";
import logoDark from "./logo-dark.svg";
import logoLight from "./logo-light.svg";

export function Welcome() {
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
          <Link
            to="/dashboard"
            className="px-6 py-3 text-xl font-semibold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
