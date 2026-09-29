import type { Metadata } from "next";
import Link from "next/link";
import { btnSecondary, chip } from "@/components/ui";
import { requireOrganizer } from "@/lib/auth";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { AdminReport } from "@/lib/types";
import { banFromReportAction, resolveReportAction } from "../actions";
import { ConfirmButton } from "../confirm-button";
import { Avatar, Badge, Empty, PageHeader } from "../ui";

export const metadata: Metadata = { title: "Nahlášení" };

const small = "!px-4 !py-2 !text-[14px]";

export default async function AdminReportsPage(props: PageProps<"/admin/reports">) {
  await requireOrganizer();
  const all = (await props.searchParams).all === "1";

  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_reports", { p_open_only: !all });
  const reports = (data ?? []) as AdminReport[];

  return (
    <>
      <PageHeader title="Nahlášení" subtitle="Nahlášení od návštěvníků. Nahlášením se match mezi nimi hned zruší." />

      <div className="mb-5 flex gap-2">
        <Link href="/admin/reports" className={chip(!all)}>
          Nevyřešená
        </Link>
        <Link href="/admin/reports?all=1" className={chip(all)}>
          Všechna
        </Link>
      </div>

      {reports.length === 0 ? (
        <Empty>{all ? "Zatím nikdo nikoho nenahlásil." : "Nic k řešení."}</Empty>
      ) : (
        <ul className="grid gap-3 xl:grid-cols-2">
          {reports.map((report) => (
            <li key={report.id} className={`glass rounded-[20px] p-4 ${report.resolved_at ? "opacity-70" : ""}`}>
              <div className="flex items-center gap-3">
                <Avatar photo={report.reported_photo} name={report.reported_name} className="size-12" />
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/users/${report.reported_id}`} className="block truncate text-[17px] font-semibold hover:text-ink">
                    {report.reported_name ?? "Smazaný profil"}
                  </Link>
                  <p className="text-[13px] text-muted">
                    nahlásil/a {report.reporter_name ?? "smazaný účet"} · {formatDateTime(report.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {report.reported_banned && <Badge tone="danger">Zablokovaný</Badge>}
                  {report.reported_total > 1 && <Badge tone="accent">{report.reported_total}× nahlášen/a</Badge>}
                  {report.resolved_at && <Badge tone="success">Vyřešeno</Badge>}
                </div>
              </div>

              <p className="glass-inner mt-3 rounded-[14px] px-4 py-3 text-[15px] leading-snug">„{report.reason}“</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <form action={resolveReportAction.bind(null, report.id, !report.resolved_at)}>
                  <button type="submit" className={`${btnSecondary} ${small}`}>
                    {report.resolved_at ? "Znovu otevřít" : "Vyřešeno"}
                  </button>
                </form>
                {!report.reported_banned && (
                  <form action={banFromReportAction.bind(null, report.reported_id, report.reason)}>
                    <ConfirmButton
                      message={`Zablokovat ${report.reported_name ?? "tento účet"}? Zmizí ostatním z balíčků i matchů.`}
                      className={`${btnSecondary} ${small} !text-danger`}
                    >
                      Zablokovat
                    </ConfirmButton>
                  </form>
                )}
                <Link href={`/admin/users/${report.reported_id}`} className={`${btnSecondary} ${small}`}>
                  Detail
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
