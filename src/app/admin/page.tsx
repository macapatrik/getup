import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { btnPrimary } from "@/components/ui";
import { requireOrganizer } from "@/lib/auth";
import { APP_NAME } from "@/lib/config";
import { dayAndMonth, eventStatus, formatDateTime, formatNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { AdminEvent, AdminOverview, AdminReport } from "@/lib/types";
import { Avatar, Empty, PageHeader, SectionTitle, StatTile, StatusBadge, list, row } from "./ui";

export const metadata: Metadata = { title: { absolute: `Administrace · ${APP_NAME}` } };

export default async function AdminHomePage() {
  await requireOrganizer();
  const supabase = await createClient();
  const [{ data: overviewRows }, { data: eventRows }, { data: reportRows }] = await Promise.all([
    supabase.rpc("admin_overview"),
    supabase.rpc("admin_events"),
    supabase.rpc("admin_reports", { p_open_only: true }),
  ]);

  const overview = (overviewRows as AdminOverview[] | null)?.[0];
  const events = ((eventRows ?? []) as AdminEvent[])
    .filter((e) => eventStatus(e) !== "closed")
    .sort((a, b) => a.starts_at.localeCompare(b.starts_at))
    .slice(0, 6);
  const reports = ((reportRows ?? []) as AdminReport[]).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Přehled"
        subtitle={`Co se děje na ${APP_NAME}`}
        action={
          <Link href="/admin/events/new" className={`${btnPrimary} !px-5 !py-3 !text-[15px]`}>
            <Icon name="plus" className="size-5" /> Nová akce
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Uživatelé" value={overview?.users} hint={overview ? `+${overview.new_users_7d} za 7 dní` : undefined} />
        <StatTile label="Matche" value={overview?.matches} hint={overview ? `+${overview.matches_24h} za 24 hodin` : undefined} />
        <StatTile label="S kontaktem" value={overview?.with_contact} hint={overview ? `z ${formatNumber(overview.profiles)} profilů` : undefined} />
        <StatTile
          label="Nahlášení"
          value={overview?.open_reports}
          hint={overview ? `${overview.banned} zablokovaných účtů` : undefined}
          alert={Boolean(overview?.open_reports)}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section>
          <SectionTitle title="Aktuální a nadcházející akce" href="/admin/events" />
          {events.length === 0 ? (
            <Empty>Žádná naplánovaná akce.</Empty>
          ) : (
            <ul className={list}>
              {events.map((event) => {
                const { day, month } = dayAndMonth(event.starts_at);
                return (
                  <li key={event.id}>
                    <Link href={`/admin/events/${event.id}`} className={row}>
                      <span className="fill-soft flex size-12 shrink-0 flex-col items-center justify-center rounded-[12px]">
                        <span className="text-[10px] font-bold text-muted uppercase">{month}</span>
                        <span className="font-display text-[19px] leading-none font-bold">{day}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[16px] font-semibold">{event.name}</span>
                        <span className="block truncate text-[13px] text-muted">
                          {formatNumber(event.attendees)} lidí · {formatNumber(event.matches)} matchů
                        </span>
                      </span>
                      <StatusBadge status={eventStatus(event)} />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <SectionTitle title="K vyřešení" href="/admin/reports" />
          {reports.length === 0 ? (
            <Empty>Žádná nevyřešená nahlášení.</Empty>
          ) : (
            <ul className={list}>
              {reports.map((report) => (
                <li key={report.id}>
                  <Link href={`/admin/users/${report.reported_id}`} className={row}>
                    <Avatar photo={report.reported_photo} name={report.reported_name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-semibold">{report.reported_name ?? "Smazaný profil"}</span>
                      <span className="block truncate text-[13px] text-muted">„{report.reason}“</span>
                    </span>
                    <span className="shrink-0 text-[12px] text-muted">{formatDateTime(report.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
