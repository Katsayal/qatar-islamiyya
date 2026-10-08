import { logout } from "@/app/login/actions";
import type { Profile } from "@/lib/auth";

export function PortalHeader({ profile }: { profile: Profile }) {
  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm font-semibold">{profile.full_name}</p>
          <p className="text-xs capitalize text-muted-foreground">
            {profile.role}
            {profile.is_owner && " · owner"}
          </p>
        </div>
        <form action={logout}>
          <button className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted">Log out</button>
        </form>
      </div>
    </header>
  );
}
