
import { cookies } from "next/headers";
import * as jwt from "jsonwebtoken";

export type Role = "owner" | "marketing" | "staff" | "admin";

export type SessionPayload = {
  sub?: string; // userId
  role?: Role;
  businessId?: string;
};

function getCookieName() {
  return process.env.COOKIE_NAME ?? "token";
}

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("Missing JWT_SECRET in .env.local");
  return secret;
}

export async function requireSession(): Promise<SessionPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value ?? null;

  if (!token) throw new Error("NO_TOKEN");

  const decoded = jwt.verify(token, getJwtSecret()) as SessionPayload;

  if (!decoded.role || !["owner", "marketing", "staff", "admin"].includes(decoded.role)) {
    throw new Error("INVALID_ROLE");
  }

  return decoded;
}

export async function requireRole(allowed: Role | Role[]): Promise<SessionPayload> {
  const session = await requireSession();
  const list = Array.isArray(allowed) ? allowed : [allowed];

  if (!session.role || !list.includes(session.role)) {
    throw new Error("FORBIDDEN_ROLE");
  }

  return session;
}

