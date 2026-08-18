import { requireFamilyProfile } from "@/lib/auth/session";
import { Nav } from "./nav";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const profile = await requireFamilyProfile();

  return (
    <div className="flex-1 flex flex-col">
      <Nav profile={profile} />
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
