import type { Metadata } from "next";
import { requireOrganizer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = { title: { default: "Administrace", template: "%s · Administrace" } };

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireOrganizer();
  const supabase = await createClient();
  const { count } = await supabase.from("reports").select("id", { count: "exact", head: true }).is("resolved_at", null);

  return (
    <div className="print-full min-h-dvh lg:pl-72">
      <AdminNav email={user.email} openReports={count ?? 0} />
      <main className="print-full mx-auto max-w-6xl px-5 pb-16 lg:px-10 lg:pt-8">{children}</main>
    </div>
  );
}
