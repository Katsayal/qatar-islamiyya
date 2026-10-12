import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { withStaffTag } from "@/lib/people";
import { createClient } from "@/lib/supabase/server";
import { BookForm } from "../book-form";

export default async function NewBookPage() {
  await requireRole("staff");
  const supabase = await createClient();
  const { data: teachers } = await supabase.from("profiles").select("id, full_name, role").in("role", ["teacher", "staff"]).eq("active", true).order("full_name");

  return (
    <div className="max-w-xl">
      <Link href="/portal/books" className="text-sm text-primary underline-offset-4 hover:underline">
        ← Books
      </Link>
      <h1 className="mt-2 text-2xl font-semibold gold-bar">Add book</h1>
      <div className="mt-4">
        <BookForm
          teachers={withStaffTag(teachers)}
          defaults={{ term_number: "1", subject: "", title: "", author: "", study_type: "", teacher_id: "", started_on: "", finished_on: "" }}
        />
      </div>
    </div>
  );
}
