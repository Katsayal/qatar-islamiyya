import { redirect } from "next/navigation";

// The hifz history now lives on the student page itself. Keep old links (and their term/page) working.
export default async function HifzHistoryRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; studentId: string }>;
  searchParams: Promise<{ term?: string; page?: string }>;
}) {
  const { id, studentId } = await params;
  const sp = await searchParams;
  const query = new URLSearchParams({ ...(sp.term ? { term: sp.term } : {}), ...(sp.page ? { page: sp.page } : {}) }).toString();
  redirect(`/portal/classes/${id}/students/${studentId}${query ? `?${query}` : ""}`);
}
