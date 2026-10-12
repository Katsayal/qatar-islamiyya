import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { DocumentForm } from "../../document-form";
import { DeleteDocument } from "./delete-document";
import { FreshOnVisit } from "@/components/fresh-on-visit";

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("staff");
  const { id } = await params;
  const supabase = await createClient();
  const { data: d } = await supabase.from("documents").select("id, title, category, visibility").eq("id", id).maybeSingle();
  if (!d) notFound();

  return (
    <FreshOnVisit>
      <div className="max-w-xl">
        <Link href="/portal/documents" className="text-sm text-primary underline-offset-4 hover:underline">
          ← Documents
        </Link>
        <h1 className="mt-2 text-2xl font-semibold gold-bar">Edit document</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {d.visibility === "vault" ? "Vault (staff only)" : "General (teachers & staff)"}. To move it to the other list, delete it and upload it again.
        </p>
        <div className="mt-4">
          <DocumentForm defaults={{ id: d.id, title: d.title, category: d.category ?? "" }} />
        </div>
        <div className="mt-8">
          <DeleteDocument id={d.id} />
        </div>
      </div>
    </FreshOnVisit>
  );
}
