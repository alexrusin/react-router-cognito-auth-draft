import { Authenticator } from "remix-auth";
import { OAuth2Strategy, CodeChallengeMethod } from "remix-auth-oauth2";
import type { OAuth2Tokens } from "arctic";

type User = {
  id: string;
  email: string;
  name: string;
};

export const authenticator = new Authenticator<User>();

authenticator.use(
  new OAuth2Strategy(
    {
      cookie: "oauth2", // Optional, can also be an object with more options

      clientId: process.env.COGNITO_CLIENT_ID || "",
      clientSecret: process.env.COGNITO_CLIENT_SECRET || "",

      authorizationEndpoint: `${process.env.COGNITO_DOMAIN}/oauth2/authorize`,
      tokenEndpoint: `${process.env.COGNITO_DOMAIN}/oauth2/token`,
      redirectURI: "http://localhost:5173/auth/callback",
      tokenRevocationEndpoint: `${process.env.COGNITO_DOMAIN}/revoke`, // optional

      scopes: ["openid", "email"], // optional
      codeChallengeMethod: CodeChallengeMethod.S256, // optional
    },
    async ({ tokens, request }) => {
      // here you can use the params above to get the user and return it
      // what you do inside this and how you find the user is up to you
      return await getUser(tokens, request);
    },
  ),
  // this is optional, but if you setup more than one OAuth2 instance you will
  // need to set a custom name to each one
  "cognito-auth",
);

async function getUser(tokens: OAuth2Tokens, request: Request): Promise<User> {
  const idToken = tokens.idToken();
  console.log("id token", idToken);
  return {
    id: "123",
    email: "name@email.com",
    name: "User Name",
  };
}
