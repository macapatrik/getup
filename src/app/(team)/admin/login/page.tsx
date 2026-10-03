import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getUser, isOrganizer } from "@/lib/auth";
import { safeNext } from "@/lib/navigation";
import { AdminLoginForm } from "./login-form";

export const metadata: Metadata = { title: "Přihlášení týmu" };

/** Přihlášení do administrace e-mailem a heslem (mimo layout administrace, ten vyžaduje organizátora). */
export default async function AdminLoginPage(props: PageProps<"/admin/login">) {
  const { next } = await props.searchParams;
  const nextPath = safeNext(typeof next === "string" ? next : null, "/admin");
  const user = await getUser();
  if (user && (await isOrganizer())) redirect(nextPath.startsWith("/admin") ? nextPath : "/admin");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-safe pb-6">
      <div className="pt-4">
        <Logo tagline />
      </div>
      <h1 className="mt-8 text-[28px] leading-tight font-bold">Administrace</h1>
      <p className="mt-1 text-[16px] text-muted">Přihlášení pro tým GetUp e-mailem a heslem.</p>
      {user && (
        <p className="fill-soft mt-4 rounded-[12px] px-4 py-3 text-[14px] text-muted">
          Jsi přihlášený/á jako <span className="font-semibold text-ink">{user.email}</span>, tenhle účet do administrace nemůže.
          Přihlas se týmovým účtem.
        </p>
      )}
      <AdminLoginForm next={nextPath.startsWith("/admin") ? nextPath : "/admin"} />
      <p className="mt-auto pt-8 text-center text-[12px] text-muted">
        Návštěvník akce?{" "}
        <Link href="/login" className="font-semibold text-accent">
          Přihlášení kódem z e-mailu
        </Link>
      </p>
    </main>
  );
}
