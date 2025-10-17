import { useEffect, useState } from "react";
import type { Route } from "./+types/account-settings";
import { authMiddleware } from "~/middleware/authMiddleware";
import { data, useFetcher } from "react-router";
import { commitSession, getSession } from "~/services/session.server";
import {
  AdminGetUserCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  GetUserAttributeVerificationCodeCommand,
  VerifyUserAttributeCommand,
} from "@aws-sdk/client-cognito-identity-provider";

export const middleware: Route.MiddlewareFunction[] = [authMiddleware];

export async function loader({ request }: Route.LoaderArgs) {
  const session = await getSession(request.headers.get("Cookie"));

  const client = new CognitoIdentityProviderClient({});
  const command = new AdminGetUserCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID || "",
    Username: session.get("user")?.username || "",
  });

  const cognitoUser = await client.send(command);
  if (!cognitoUser.UserAttributes) {
    throw new Error("Error getting user information");
  }
  const user = Object.fromEntries(
    cognitoUser.UserAttributes.map((item) => [
      item.Name ?? "",
      item.Value ?? "",
    ]),
  );

  return data(user);
}

export async function action({ request }: Route.ActionArgs) {
  //   await new Promise((res) => setTimeout(res, 1000));
  const formData = await request.formData();
  const name = (formData.get("name") as string) || "";
  const email = (formData.get("email") as string) || "";
  const code = (formData.get("code") as string) || "";
  const resendVerification = formData.get("resendVerification") === "true";
  const newPassword = (formData.get("newPassword") as string) || "";

  if (name && name.trim() === "") {
    return { ok: false, error: "Name cannot be empty" };
  }
  if (email && email.trim() === "") {
    return { ok: false, error: "Email cannot be empty" };
  }

  if (code && code.trim() === "") {
    return { ok: false, error: "Verification code cannot be empty" };
  }

  if (newPassword && newPassword.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  const session = await getSession(request.headers.get("Cookie"));
  const username = session.get("user")?.username || "";

  const client = new CognitoIdentityProviderClient({});

  if (code) {
    try {
      await client.send(
        new VerifyUserAttributeCommand({
          AccessToken: session.get("user")?.accessToken,
          AttributeName: "email",
          Code: code,
        }),
      );
      return {
        ok: true,
        message: "Email verified successfully",
      };
    } catch (error: any) {
      return { ok: false, error: error.message || "Failed to verify email" };
    }
  }

  if (resendVerification) {
    try {
      await client.send(
        new GetUserAttributeVerificationCodeCommand({
          AccessToken: session.get("user")?.accessToken,
          AttributeName: "email",
        }),
      );
      return { ok: true, message: "Verification code sent!" };
    } catch (error: any) {
      return {
        ok: false,
        error: error.message || "Failed to send verification code",
      };
    }
  }

  if (newPassword) {
    try {
      await client.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: process.env.COGNITO_USER_POOL_ID || "",
          Username: username,
          Password: newPassword,
          Permanent: true,
        }),
      );
      return { ok: true, message: "Password updated successfully" };
    } catch (error: any) {
      return { ok: false, error: error.message || "Failed to update password" };
    }
  }

  // Update user attributes
  const userAttributes = [];
  if (name) {
    userAttributes.push({ Name: "name", Value: name });
  }
  if (email) {
    userAttributes.push({ Name: "email", Value: email });
  }

  if (userAttributes.length === 0) {
    return { ok: false, error: "No data to update" };
  }

  const command = new AdminUpdateUserAttributesCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID || "",
    Username: username,
    UserAttributes: userAttributes,
  });

  try {
    await client.send(command);
    // Update session user object
    const user = session.get("user");
    if (user) {
      if (name) user.name = name;
      session.set("user", user);
    }

    return {
      ok: true,
      message: "User information updated successfully",
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    };
  } catch (error: any) {
    return { ok: false, error: error.message || "Failed to update" };
  }
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
