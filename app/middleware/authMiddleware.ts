import { redirect } from "react-router";
import { userContext } from "~/context";
import { ApiClient } from "~/services/ApiClient";
import { getSession } from "~/services/session.server";

// @ts-expect-error error due to remix types
export const authMiddleware = async ({ request, context }, next) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (!user) {
    throw redirect("/");
  }

  const apiClient = new ApiClient(session, process.env.COGNITO_DOMAIN || "");

  const userResponse = await apiClient.request({
    method: "GET",
    url: "oauth2/userInfo",
  });

  context.set(userContext, userResponse.data);

  const response = await next();

  response.headers.set("Set-Cookie", await apiClient.commit());
};
