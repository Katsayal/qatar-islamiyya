import { NextResponse } from "next/server";
import { z } from "zod";
import { getProfile } from "@/lib/auth";
import { bucketFor } from "@/lib/documents";
import { createClient } from "@/lib/supabase/server";

// Short-lived signed link. The row is read with the user's own client, so RLS decides who may open it.
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const profile = await getProfile();
  if (!profile || profile.role === "student") return new NextResponse("Not found", { status: 404 });

  const id = z.string().uuid().safeParse((await params).id);
  if (!id.success) return new NextResponse("Not found", { status: 404 });

  const supabase = await createClient();
  const { data: doc } = await supabase.from("documents").select("title, file_path, visibility").eq("id", id.data).maybeSingle();
  if (!doc) return new NextResponse("Not found", { status: 404 });

  const ext = doc.file_path.split(".").pop();
  const filename = `${doc.title.replace(/[^\p{L}\p{N} _-]+/gu, "").trim() || "document"}.${ext}`;
  const { data } = await supabase.storage.from(bucketFor(doc.visibility)).createSignedUrl(doc.file_path, 60, { download: filename });
  if (!data) return new NextResponse("Not found", { status: 404 });

  return NextResponse.redirect(data.signedUrl);
}
