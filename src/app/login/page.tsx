import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppIcon } from "@/components/logo";
import { getUser } from "@/lib/auth";
import { safeNext } from "@/lib/navigation";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Přihlášení" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { next, error } = await props.searchParams;
  const nextPath = safeNext(typeof next === "string" ? next : null);
  if (await getUser()) redirect(nextPath);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-safe pb-8">
      <div className="mt-16 flex flex-col items-center text-center">
        <AppIcon className="size-20 rounded-[22px]" mark="size-14" />
        <h1 className="mt-6 font-display text-[30px] font-bold tracking-tight">Přihlas se</h1>
        <p className="mt-2 max-w-xs text-[17px] text-muted">Pošleme ti na e-mail kód. Žádné heslo si nemusíš pamatovat.</p>
      </div>
      <LoginForm next={nextPath} linkError={error === "link"} />
      <p className="mt-auto pt-8 text-center text-[12px] text-muted">
        Přihlášením souhlasíš s{" "}
        <Link href="/podminky" className="underline">
          podmínkami užití
        </Link>{" "}
        a{" "}
        <Link href="/soukromi" className="underline">
          ochranou soukromí
        </Link>
        .
      </p>
    </main>
  );
}
