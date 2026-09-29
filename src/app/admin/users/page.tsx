import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { btnSecondary, input } from "@/components/ui";
import { requireOrganizer } from "@/lib/auth";
import { formatDate, formatNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { AdminUserRow } from "@/lib/types";
import { Avatar, Badge, Empty, PageHeader, list, row } from "../ui";

export const metadata: Metadata = { title: "Uživatelé" };

const PAGE_SIZE = 50;

export default async function AdminUsersPage(props: PageProps<"/admin/users">) {
  await requireOrganizer();
  const params = await props.searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 100) : "";
  const page = Math.max(1, Number(params.page) || 1);

  const supabase = await createClient();
  const { data } = await supabase.rpc("admin_users", {
    p_query: query || null,
    p_limit: PAGE_SIZE,
    p_offset: (page - 1) * PAGE_SIZE,
  });
  const users = (data ?? []) as AdminUserRow[];
  const total = users[0]?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageHref = (p: number) => `/admin/users?${new URLSearchParams({ ...(query ? { q: query } : {}), page: String(p) })}`;

  return (
    <>
      <PageHeader title="Uživatelé" subtitle={`${formatNumber(total)} ${query ? "nalezených" : "registrovaných"} účtů`} />

      <form action="/admin/users" className="mb-5 flex max-w-xl gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Hledat</span>
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={query} placeholder="Jméno nebo e-mail" className={`${input} !py-3 pl-11`} />
        </label>
        <button type="submit" className={btnSecondary}>
          Hledat
        </button>
      </form>

      {users.length === 0 ? (
        <Empty>{query ? `Nikdo neodpovídá „${query}“.` : "Zatím tu nikdo není."}</Empty>
      ) : (
        <div className={list}>
          <div className="hidden items-center gap-3 px-4 py-2.5 text-[12px] font-semibold tracking-wide text-muted uppercase md:flex">
            <span className="w-10" />
            <span className="flex-1">Uživatel</span>
            <span className="w-28">Registrace</span>
            <span className="w-16 text-right">Akcí</span>
            <span className="w-16 text-right">Matchů</span>
            <span className="w-40 text-right">Stav</span>
          </div>
          {users.map((user) => (
            <Link key={user.id} href={`/admin/users/${user.id}`} className={row}>
              <Avatar photo={user.photo} name={user.display_name ?? user.email} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[16px] font-semibold">
                  {user.display_name ? `${user.display_name}, ${user.age}` : <span className="text-muted">Bez profilu</span>}
                </span>
                <span className="block truncate text-[13px] text-muted">{user.email}</span>
              </span>
              <span className="hidden w-28 text-[14px] text-muted md:block">{formatDate(user.created_at)}</span>
              <span className="hidden w-16 text-right text-[15px] font-semibold md:block">{user.events}</span>
              <span className="hidden w-16 text-right text-[15px] font-semibold md:block">{user.matches}</span>
              <span className="flex shrink-0 flex-wrap justify-end gap-1 md:w-40">
                {user.organizer && <Badge tone="info">Tým</Badge>}
                {user.banned && <Badge tone="danger">Zablokovaný</Badge>}
                {!user.banned && user.reports > 0 && <Badge tone="accent">{user.reports}× nahlášen</Badge>}
              </span>
            </Link>
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-5 flex items-center justify-between gap-3">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className={btnSecondary}>
              ← Předchozí
            </Link>
          ) : (
            <span />
          )}
          <span className="text-[14px] text-muted">
            Strana {page} z {pages}
          </span>
          {page < pages ? (
            <Link href={pageHref(page + 1)} className={btnSecondary}>
              Další →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
