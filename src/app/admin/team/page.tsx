import type { Metadata } from "next";
import { btnSecondary, card, sectionTitle } from "@/components/ui";
import { requireOrganizer } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Organizer } from "@/lib/types";
import { removeOrganizerAction } from "../actions";
import { ConfirmButton } from "../confirm-button";
import { Avatar, Badge, PageHeader, list } from "../ui";
import { AddOrganizerForm } from "./add-organizer-form";

export const metadata: Metadata = { title: "Tým" };

export default async function AdminTeamPage() {
  const me = await requireOrganizer();
  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_organizers");
  const team = (data ?? []) as Organizer[];

  return (
    <>
      <PageHeader title="Tým" subtitle="Kdo má přístup do administrace" />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)] lg:items-start">
        <ul className={list}>
          {team.map((member) => (
            <li key={member.user_id} className="flex items-center gap-3 px-4 py-3">
              <Avatar photo={member.photo} name={member.display_name ?? member.email} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold">
                  {member.display_name ?? member.email} {member.user_id === me.id && <Badge tone="info">Ty</Badge>}
                </p>
                <p className="truncate text-[13px] text-muted">
                  {member.email} · od {formatDate(member.created_at)}
                </p>
              </div>
              {member.user_id !== me.id && (
                <form action={removeOrganizerAction.bind(null, member.user_id)}>
                  <ConfirmButton
                    message={`Odebrat ${member.email} z týmu? Ztratí přístup do administrace.`}
                    className={`${btnSecondary} !px-4 !py-2 !text-[14px] !text-danger`}
                  >
                    Odebrat
                  </ConfirmButton>
                </form>
              )}
            </li>
          ))}
        </ul>

        <section>
          <h2 className={sectionTitle}>Přidat člena týmu</h2>
          <div className={card}>
            <AddOrganizerForm />
          </div>
        </section>
      </div>
    </>
  );
}
