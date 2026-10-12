import Link from "next/link";
import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { withStaffTag } from "@/lib/people";
import { createClient } from "@/lib/supabase/server";
import { BookForm } from "../../book-form";
import { DeleteBook } from "./delete-book";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("staff");
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: b }, { data: teachers }] = await Promise.all([
    supabase.from("books").select("*").eq("id", id).maybeSingle(),
    supabase.from("profiles").select("id, full_name, role").in("role", ["teacher", "staff"]).eq("active", true).order("full_name"),
  ]);
  if (!b) notFound();

  return (
    <div className="max-w-xl">
      <Link href="/portal/books" className="text-sm text-primary underline-offset-4 hover:underline">
        ← Books
      </Link>
      <h1 lang="ar" dir="rtl" className="font-arabic mt-2 text-xl font-semibold">
        {b.title}
      </h1>
      <div className="mt-4">
        <BookForm
          teachers={withStaffTag(teachers)}
          defaults={{
            id: b.id,
            term_number: String(b.term_number),
            subject: b.subject,
            title: b.title,
            author: b.author ?? "",
            study_type: b.study_type ?? "",
            teacher_id: b.teacher_id ?? "",
            started_on: b.started_on ?? "",
            finished_on: b.finished_on ?? "",
          }}
        />
      </div>
      <div className="mt-8">
        <DeleteBook id={b.id} />
      </div>
    </div>
  );
}
