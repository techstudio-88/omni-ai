import { NextResponse } from "next/server";
import { guardApi } from "@/lib/api/guard";

export async function GET() {
  const guard = await guardApi("admin.overview");
  if ("response" in guard) return guard.response;
  const allowed = new Set((process.env.OMNIBRAIN_ADMIN_USER_IDS ?? "").split(",").map((value) => value.trim()).filter(Boolean));
  if (guard.auth.isDemo || !allowed.has(guard.auth.userId)) return NextResponse.json({ error: "An administrator account is required for this area." }, { status: 403 });
  return NextResponse.json({ enabled: true, globalMetrics: "not_configured", message: "Global admin reporting requires a separate, server-only administrative database connection." }, { headers: { "Cache-Control": "no-store" } });
}
