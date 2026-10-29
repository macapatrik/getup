import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { HalloweenMode } from "@/components/halloween-mode";
import { Icon } from "@/components/icons";
import { MadeBy } from "@/components/made-by";
import { getUser } from "@/lib/auth";
import { themeMetadata, themeViewport } from "@/lib/halloween-meta";
import { safeNext } from "@/lib/navigation";
import { isHalloween } from "@/lib/theme";
import { LoginForm } from "./login-form";

export const generateMetadata = (): Promise<Metadata> => themeMetadata({ title: "Přihlášení" });
export const generateViewport = themeViewport;

export default async function LoginPage(props: PageProps<"/login">) {
  const { next, error } = await props.searchParams;
  const nextPath = safeNext(typeof next === "string" ? next : null);
  if (await getUser()) redirect(nextPath);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-safe pb-6">
      <Link href="/" aria-label="Zpět na úvod" className="-ml-2 mt-1 grid size-10 place-items-center text-ink">
        <Icon name="back" className="size-6" />
      </Link>
      <h1 className="mt-3 text-[28px] leading-tight font-bold">{(await isHalloween()) ? "Vítej v temnotách!" : "Vítej!"}</h1>
      <p className="mt-1 text-[16px] text-muted">Pošleme ti na e-mail kód. Žádné heslo si nemusíš pamatovat.</p>
      <LoginForm next={nextPath} linkError={error === "link"} />
      <p className="mt-auto pt-8 text-center text-[12px] text-muted">
        Přihlášením souhlasíš s{" "}
        <Link href="/podminky" className="font-semibold text-accent">
          podmínkami užití
        </Link>{" "}
        a{" "}
        <Link href="/soukromi" className="font-semibold text-accent">
          ochranou soukromí
        </Link>
        .
      </p>
      <MadeBy className="mt-3" />
      <HalloweenMode />
    </main>
  );
}
