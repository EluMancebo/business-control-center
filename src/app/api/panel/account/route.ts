// src/app/api/panel/account/route.ts

import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Business } from "@/models/Business";
import { requireSession } from "@/lib/auth/serverSession";
import { UpdateAccountSchema } from "@/validators/account";

export async function GET() {
  try {
    const session = await requireSession();

    if (!session.sub) {
      return NextResponse.json({ error: "NO_SUB_IN_SESSION" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(session.sub)
      .select("_id name email role businessId")
      .lean<{
        _id: unknown;
        name?: string;
        email?: string;
        role?: string;
        businessId?: unknown;
      } | null>();

    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    let business: { id: string; slug: string; name: string } | null = null;

    if (user.businessId) {
      const b = await Business.findById(user.businessId)
        .select("_id slug name")
        .lean<{ _id: unknown; slug: string; name: string } | null>();

      if (b) {
        business = {
          id: String(b._id),
          slug: b.slug,
          name: b.name,
        };
      }
    }

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: String(user._id),
          name: user.name ?? "",
          email: user.email ?? "",
          role: user.role ?? "",
        },
        business,
      },
      { status: 200 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    const status = msg === "NO_TOKEN" || msg === "INVALID_ROLE" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireSession();

    if (!session.sub) {
      return NextResponse.json({ error: "NO_SUB_IN_SESSION" }, { status: 401 });
    }

    if (session.role !== "owner" && session.role !== "admin") {
      return NextResponse.json({ error: "FORBIDDEN_ROLE" }, { status: 403 });
    }

    await dbConnect();

    const json = await req.json().catch(() => null);
    const parsed = UpdateAccountSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = {};
    if (typeof parsed.data.name === "string") updates.name = parsed.data.name.trim();

    if (typeof parsed.data.email === "string") {
      const nextEmail = parsed.data.email.toLowerCase().trim();

      const existing = await User.findOne({ email: nextEmail }).lean();
      if (existing && String(existing._id) !== String(session.sub)) {
        return NextResponse.json({ error: "EMAIL_ALREADY_USED" }, { status: 409 });
      }

      updates.email = nextEmail;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "NO_CHANGES" }, { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(
      session.sub,
      { $set: updates },
      { new: true, select: "_id name email role businessId" }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: String(updated._id),
          name: updated.name,
          email: updated.email,
          role: updated.role,
        },
      },
      { status: 200 }
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN";
    const status = msg === "NO_TOKEN" || msg === "INVALID_ROLE" ? 401 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
