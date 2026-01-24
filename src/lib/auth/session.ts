import { verifyToken } from "./jwt";

export function getSessionFromToken(token: string | null) {
  if (!token) return null;
  return verifyToken(token);
}

