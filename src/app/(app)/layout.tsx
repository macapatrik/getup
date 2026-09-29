import { BottomNav } from "@/components/bottom-nav";
import { isOrganizer, requireProfile } from "@/lib/auth";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireProfile();
  const organizer = await isOrganizer();

  return (
    <div className="mx-auto min-h-dvh max-w-md pb-24">
      {children}
      <BottomNav organizer={organizer} />
    </div>
  );
}
