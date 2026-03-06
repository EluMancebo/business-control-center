// src/app/api/panel/users/[id]/route.ts
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { requireCapability } from "@/lib/auth/serverSession";
import { hashPassword } from "@/lib/auth/password";
import { ResetPasswordSchema } from "@/validators/users";
import { requireBusinessAccess } from "@/lib/auth/capabilities";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireCapability("CAN_MANAGE_USERS");
    await dbConnect();

    const { id } = await ctx.params;

    const json = await req.json().catch(() => null);
    const parsed = ResetPasswordSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const target = await User.findById(id).lean();
    if (!target) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    // multi-tenant: owner solo puede modificar usuarios de su business
    requireBusinessAccess(session, String(target.businessId));

    const passwordHash = await hashPassword(parsed.data.password);
    await User.updateOne({ _id: id }, { $set: { passwordHash } });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    const status = msg === "NO_TOKEN" || msg === "INVALID_TOKEN" ? 401 : 403;
    return NextResponse.json({ error: msg }, { status });
  }
}