import Link from "next/link";
import { btnSecondary } from "@/components/ui";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-6xl font-black text-party">404</p>
      <p className="mt-4 text-lg">Tohle jsme nenašli.</p>
      <Link href="/events" className={`${btnSecondary} mt-8`}>
        Zpět na akce
      </Link>
    </main>
  );
}
