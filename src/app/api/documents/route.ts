import { NextResponse } from "next/server";
import { guardApi } from "@/lib/api/guard";

export async function GET() {
  const guard = await guardApi("documents.read");
  if ("response" in guard) return guard.response;
  if (guard.auth.isDemo) return NextResponse.json({ demo: true, documents: [{ id: "demo-sample", name: "Getting started guide.pdf", status: "sample", size_bytes: 248_000, created_at: new Date().toISOString() }] });
  const { data, error } = await guard.supabase!.from("documents").select("id,name,mime_type,size_bytes,status,created_at,updated_at")
    .eq("user_id", guard.auth.userId).is("deleted_at", null).order("created_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: "Documents are temporarily unavailable." }, { status: 503 });
  return NextResponse.json({ documents: data ?? [], demo: false }, { headers: { "Cache-Control": "no-store" } });
}
