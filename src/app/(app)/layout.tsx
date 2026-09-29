import { BottomNav } from "@/components/bottom-nav";
import { PushSync } from "@/components/push-settings";
import { isOrganizer, requireProfile } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireProfile();
  const organizer = await isOrganizer();

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-nav">
      {children}
      <BottomNav organizer={organizer} />
      <PushSync />
    </div>
  );
}
