import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { DocumentForm } from "../document-form";

export default async function NewDocumentPage() {
  await requireRole("staff");
  return (
    <div className="max-w-xl">
      <Link href="/portal/documents" className="text-sm text-primary underline-offset-4 hover:underline">
        ← Documents
      </Link>
      <h1 className="mt-2 text-xl font-semibold">Upload document</h1>
      <div className="mt-4">
        <DocumentForm defaults={{ title: "", category: "" }} />
      </div>
    </div>
  );
}
