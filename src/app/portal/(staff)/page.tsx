import { getProfile } from "@/lib/auth";

// Placeholder until 2.1 (portal shell + dashboard).
export default async function PortalHome() {
  const profile = await getProfile();
  return (
    <div>
      <h1 className="text-xl font-semibold">Assalamu alaykum, {profile?.full_name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">The portal dashboard comes in task 2.1.</p>
    </div>
  );
}
