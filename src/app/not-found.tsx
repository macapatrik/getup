import Link from "next/link";
import { btnPrimary } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-7xl font-bold text-accent">404</p>
      <p className="mt-4 text-[17px] text-muted">Tohle jsme nenašli.</p>
      <Link href="/events" className={`${btnPrimary} mt-8`}>
        Zpět na akce
      </Link>
    </main>
  );
}
