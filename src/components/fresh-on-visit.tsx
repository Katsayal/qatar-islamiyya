"use client";

import { useRouter } from "next/navigation";
import { Fragment } from "react";

// Next 16 keeps visited pages alive (<Activity>), form values included. Wrap a page that edits data so its
// forms are re-created on every fresh visit (link click, redirect after save) and show the database, not an
// old copy. A form's own save (server re-render) and browser back/forward keep the state.
export function FreshOnVisit({ children }: { children: React.ReactNode }) {
  const { bfcacheId } = useRouter();
  return <Fragment key={bfcacheId}>{children}</Fragment>;
}
