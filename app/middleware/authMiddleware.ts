import { redirect } from "react-router";
import { userContext } from "~/context";
import { getSession } from "~/services/session.server";

// @ts-expect-error error due to remix types
export const authMiddleware = async ({ request, context }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    throw redirect("/");
  }

  context.set(userContext, user);
};
