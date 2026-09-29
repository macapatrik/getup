import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getUser } from "@/lib/auth";
import { safeNext } from "@/lib/navigation";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Přihlášení" };

export default async function LoginPage(props: PageProps<"/login">) {
  const { next, error } = await props.searchParams;
  const nextPath = safeNext(typeof next === "string" ? next : null);
  if (await getUser()) redirect(nextPath);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pt-10 pb-8">
      <Logo />
      <div className="mt-14">
        <h1 className="text-3xl font-black">Přihlas se</h1>
        <p className="mt-2 text-muted">Pošleme ti na e-mail kód. Žádné heslo si nemusíš pamatovat.</p>
      </div>
      <LoginForm next={nextPath} linkError={error === "link"} />
    </main>
  );
}
