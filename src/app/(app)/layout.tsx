import { BottomNav, SideNav } from "@/components/bottom-nav";
import { PushSync } from "@/components/push-settings";
import { requireProfile } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireProfile();

  return (
    <div className="min-h-dvh pb-nav lg:pb-12 lg:pl-72">
      {children}
      <SideNav />
      <BottomNav />
      <PushSync />
    </div>
  );
}
