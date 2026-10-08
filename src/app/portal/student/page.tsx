import { getProfile } from "@/lib/auth";

// Placeholder until Phase 5 (student portal).
export default async function StudentHome() {
  const profile = await getProfile();
  return (
    <div>
      <h1 className="text-xl font-semibold">Assalamu alaykum, {profile?.full_name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Your student portal is coming soon.</p>
    </div>
  );
}
