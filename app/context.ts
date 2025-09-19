import { createContext } from "react-router";

export const userContext = createContext<UserInfo | null>(null);
