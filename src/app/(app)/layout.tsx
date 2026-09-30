import { BottomNav, SideNav } from "@/components/bottom-nav";
import { PushSync } from "@/components/push-settings";
import { requireProfile } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireProfile();

  // Místo pro spodní lištu si každá stránka řeší sama (pb-nav / pb-nav-tight).
  return (
    <div className="min-h-dvh lg:pl-72">
      {children}
      <SideNav />
      <BottomNav />
      <PushSync />
    </div>
  );
}
