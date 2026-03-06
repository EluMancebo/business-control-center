// src/lib/auth/capabilities.ts
import type { Role, SessionPayload } from "@/lib/auth/serverSession";

export type Capability =
  | "CAN_MANAGE_USERS"
  | "CAN_EDIT_WEB"
  | "CAN_PUBLISH_WEB"
  | "CAN_MANAGE_PRESETS_SYSTEM"
  // ✅ Staff / Operaciones
  | "CAN_MANAGE_APPOINTMENTS"
  | "CAN_VIEW_ASSIGNED_LEADS";

const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
  admin: [
    "CAN_MANAGE_USERS",
    "CAN_EDIT_WEB",
    "CAN_PUBLISH_WEB",
    "CAN_MANAGE_PRESETS_SYSTEM",
    "CAN_MANAGE_APPOINTMENTS",
    "CAN_VIEW_ASSIGNED_LEADS",
  ],

  // ✅ Owner: control negocio + accesos + web + operaciones
  owner: [
    "CAN_MANAGE_USERS",
    "CAN_EDIT_WEB",
    "CAN_PUBLISH_WEB",
    "CAN_MANAGE_APPOINTMENTS",
    "CAN_VIEW_ASSIGNED_LEADS",
  ],

  // ✅ Marketing: web edit/publish + acceso a leads (para marketing y seguimiento)
  marketing: [
    "CAN_EDIT_WEB",
    "CAN_PUBLISH_WEB",
    "CAN_VIEW_ASSIGNED_LEADS",
  ],

  // ✅ Staff: operaciones: citas + leads asignados
  staff: [
    "CAN_MANAGE_APPOINTMENTS",
    "CAN_VIEW_ASSIGNED_LEADS",
  ],
};

export function getCapabilitiesForRole(role: Role): Set<Capability> {
  return new Set(ROLE_CAPABILITIES[role] ?? []);
}

export function hasCapability(session: SessionPayload, cap: Capability): boolean {
  const role = session.role;
  if (!role) return false;
  if (role === "admin") return true; // bypass total
  return getCapabilitiesForRole(role).has(cap);
}

/**
 * Protege acceso multi-tenant.
 * - Admin bypass.
 * - Resto: solo puede operar dentro de su businessId.
 */
export function requireBusinessAccess(session: SessionPayload, businessId: string) {
  if (session.role === "admin") return; // bypass
  if (!session.businessId) throw new Error("NO_BUSINESS_IN_SESSION");
  if (String(session.businessId) !== String(businessId)) {
    throw new Error("FORBIDDEN_BUSINESS");
  }
}
