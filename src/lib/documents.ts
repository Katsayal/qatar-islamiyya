// General files live in the `documents` bucket, vault files in the staff-only `vault` bucket.
export const bucketFor = (visibility: string) => (visibility === "vault" ? "vault" : "documents");
