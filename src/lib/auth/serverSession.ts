// src/lib/auth/serverSession.ts
import { cookies } from "next/headers";
import type { Capability } from "@/lib/auth/capabilities";
import { hasCapability } from "@/lib/auth/capabilities";
import { verifyToken, type Role as JwtRole } from "@/lib/auth/jwt";

export type Role = JwtRole;

export type SessionPayload = {
  sub?: string; // userId
  role?: Role;
  businessId?: string;
  email?: string;
};

function getCookieName() {
  return process.env.COOKIE_NAME ?? "token";
}

export async function requireSession(): Promise<SessionPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get(getCookieName())?.value ?? null;

  if (!token) throw new Error("NO_TOKEN");

  const decoded = verifyToken(token);
  if (!decoded) throw new Error("INVALID_TOKEN");

  if (!decoded.role || !["owner", "marketing", "staff", "admin"].includes(decoded.role)) {
    throw new Error("INVALID_ROLE");
  }

  return {
    sub: decoded.sub,
    role: decoded.role,
    businessId: decoded.businessId,
    email: decoded.email,
  };
}

export async function requireRole(allowed: Role | Role[]): Promise<SessionPayload> {
  const session = await requireSession();
  const list = Array.isArray(allowed) ? allowed : [allowed];

  if (!session.role || !list.includes(session.role)) {
    throw new Error("FORBIDDEN_ROLE");
  }

  return session;
}

export async function requireAdmin(): Promise<SessionPayload> {
  return requireRole("admin");
}

export async function requireCapability(cap: Capability): Promise<SessionPayload> {
  const session = await requireSession();

  if (!hasCapability(session, cap)) {
    throw new Error("FORBIDDEN_CAPABILITY");
  }

  return session;
}


