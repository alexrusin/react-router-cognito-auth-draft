import { useEffect, useState } from "react";
import type { Route } from "./+types/account-settings";
import { authMiddleware } from "~/middleware/authMiddleware";
import { data, useFetcher } from "react-router";

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ request }: Route.LoaderArgs) {
  const user = {
    name: "John Doe",
    email: "john@email.com",
    email_verified: "true",
    identities: null,
  };

  return data(user);
}

export async function action({ request }: Route.ActionArgs) {
  return {
    ok: true,
    message: "User information updated successfully",
  };
}

export default function AccountSettings({ loaderData }: Route.ComponentProps) {
  const user = loaderData;
  const fetcher = useFetcher();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [displayError, setDisplayError] = useState<string | null>(null);
  const [displaySuccess, setDisplaySuccess] = useState<string | null>(null);

  useEffect(() => {
    if (displayError || displaySuccess) {
      setDisplayError(null);
      setDisplaySuccess(null);
    }
  }, [editingField]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.ok && fetcher.data.message) {
        setDisplaySuccess(fetcher.data.message);
        setTimeout(() => {
          setEditingField(null);
        }, 1000);
      } else if (!fetcher.data.ok && fetcher.data.error) {
        setDisplayError(fetcher.data.error);
      }
    }
  }, [fetcher.state, fetcher.data]);

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 mt-10 rounded-xl shadow-sm">
      {/* Basic Information */}
      <h2 className="text-xl font-semibold mb-4 border-b pb-2">
        Basic Information
      </h2>

      {/* Name */}
      <div className="mb-6">
        {editingField === "name" ? (
          <div>
            <fetcher.Form method="post">
              <input
                type="text"
                name="name"
                defaultValue={user.name}
                className="border border-gray-300 rounded-full px-4 py-2 w-full focus:outline-none"
                required
              />
              {displayError && (
                <p style={{ color: "red" }}>{fetcher.data.error}</p>
              )}
              {displaySuccess && (
                <p style={{ color: "green" }}>{fetcher.data.message}</p>
              )}
              <div className="flex gap-3 mt-3">
                <button
                  type="submit"
                  className="bg-brown-700 bg-blue-600 text-white px-3 py-1 rounded-md cursor-pointer"
                >
                  {fetcher.state !== "idle" ? (
                    <span>Saving...</span>
                  ) : (
                    <span>Save</span>
                  )}
                </button>
                <button
                  onClick={() => setEditingField(null)}
                  className="text-sm text-gray-600 underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </fetcher.Form>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-gray-800">{user.name}</span>
            <button
              className="text-sm text-gray-600 underline cursor-pointer"
              onClick={() => setEditingField("name")}
            >
              Edit
            </button>
          </div>
        )}
      </div>

      {/* Email */}
      {user.email && (
        <div className="mb-6">
          {editingField === "email" ? (
            <div>
              <fetcher.Form method="post">
                <input
                  type="email"
                  name="email"
                  defaultValue={user.email}
                  className="border border-gray-300 rounded-full px-4 py-2 w-full focus:outline-none"
                  required
                />
                {displayError && (
                  <p style={{ color: "red" }}>{fetcher.data.error}</p>
                )}
                <div className="flex gap-3 mt-3">
                  <button
                    type="submit"
                    className="bg-brown-700 bg-blue-600 text-white px-3 py-1 rounded-md text-sm cursor-pointer"
                  >
                    {fetcher.state !== "idle" ? (
                      <span>Saving...</span>
                    ) : (
                      <span>Save</span>
                    )}
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="text-sm text-gray-600 underline cursor-pointer"
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </fetcher.Form>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <span className="text-gray-800">{user.email}</span>
              <button
                className="text-sm text-gray-600 underline cursor-pointer"
                onClick={() => setEditingField("email")}
              >
                Edit
              </button>
            </div>
          )}
        </div>
      )}

      {user.email_verified === "false" && (
        <div className="mb-6">
          <fetcher.Form method="post">
            <label className="block mb-2">
              Enter the verification code sent to your new email:
            </label>
            <input
              type="text"
              name="code"
              className="border border-gray-300 rounded-full px-4 py-2 w-full focus:outline-none"
              required
            />
            {displayError && (
              <p style={{ color: "red" }}>{fetcher.data.error}</p>
            )}
            {displaySuccess && (
              <p style={{ color: "green" }}>{fetcher.data.message}</p>
            )}
            <button
              type="submit"
              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm mt-2 cursor-pointer"
            >
              {fetcher.state !== "idle" ? (
                <span>Verifying...</span>
              ) : (
                <span>Verify Email</span>
              )}
            </button>
          </fetcher.Form>
          <fetcher.Form method="post" className="mt-2">
            <input type="hidden" name="resendVerification" value="true" />
            <button
              type="submit"
              className="text-blue-600 text-sm underline cursor-pointer"
              disabled={fetcher.state !== "idle"}
            >
              {fetcher.state !== "idle"
                ? "Sending..."
                : "Resend verification code"}
            </button>
          </fetcher.Form>
        </div>
      )}

      {/* Login Information */}
      {!user.identities && (
        <>
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">
            Login Information
          </h2>

          {/* Password */}
          <div>
            <label className="block text-gray-500 text-sm mb-1">Password</label>
            {editingField === "password" ? (
              <fetcher.Form method="post">
                <input
                  type="password"
                  name="newPassword"
                  placeholder="New password"
                  className="border border-gray-300 rounded-full px-4 py-2 w-full focus:outline-none"
                  minLength={8}
                  required
                />
                {displayError && (
                  <p style={{ color: "red" }}>{fetcher.data.error}</p>
                )}
                {displaySuccess && (
                  <p style={{ color: "green" }}>{fetcher.data.message}</p>
                )}
                <div className="flex gap-3 mt-3">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm cursor-pointer"
                  >
                    {fetcher.state !== "idle" ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="text-sm text-gray-600 underline cursor-pointer"
                    onClick={() => setEditingField(null)}
                  >
                    Cancel
                  </button>
                </div>
              </fetcher.Form>
            ) : (
              <div className="flex justify-between items-center">
                <span className="text-gray-800">***********</span>
                <button
                  className="text-sm text-gray-600 underline cursor-pointer"
                  onClick={() => setEditingField("password")}
                  type="button"
                >
                  Edit
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
