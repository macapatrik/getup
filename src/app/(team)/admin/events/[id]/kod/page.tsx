import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { requireOrganizer } from "@/lib/auth";
import { HALLOWEEN_URL } from "@/lib/config";
import { createClient } from "@/lib/supabase/server";
import { metalMania } from "../../../../../halloween/fonts";
import { Countdown } from "./countdown";

export const metadata: Metadata = { title: "Kód pro hlasování", robots: { index: false } };
export const viewport: Viewport = { themeColor: "#07060a" };

/**
 * Obrazovka do klubu (projektor, televize, tablet u stage): kód pro odemčení hlasování o kostýmech.
 * Kód se mění každých 5 minut a platí ještě 5 minut po změně, takže fotka z Instagramu je rychle k ničemu.
 * Mimo layout administrace, ať je přes celou obrazovku.
 */
export default async function VenueCodePage(props: PageProps<"/admin/events/[id]/kod">) {
  const { id } = await props.params;
  await requireOrganizer();
  const supabase = await createClient();

  const [{ data: event }, { data: rows, error }] = await Promise.all([
    supabase.from("events").select("name, join_code, costume_contest, costume_voting_open").eq("id", id).maybeSingle(),
    supabase.rpc("admin_costume_checkin_code", { p_event_id: id }),
  ]);
  const row = (rows as { code: string; changes_at: string; checked_in: number }[] | null)?.[0];
  if (!event || error || !row) notFound();

  // Naskenováním se člověk připojí k akci (i nový) a hlasování se mu rovnou odemkne; vede na halloweenskou verzi appky.
  const url = `${HALLOWEEN_URL}/j/${event.join_code}?kod=${row.code}`;
  const qr = await QRCode.toDataURL(url, { width: 720, margin: 1, errorCorrectionLevel: "M" });
  const off = !event.costume_contest || !event.costume_voting_open;

  return (
    <main
      className={`hw ${metalMania.variable} flex min-h-dvh flex-col items-center justify-center gap-[3vh] bg-night px-6 py-8 text-center text-bone`}
    >
      <p className="font-metal hw-glow text-[clamp(32px,6vw,72px)] leading-none text-blood">Hlasuj o nejlepší kostým</p>
      <div className="flex flex-col items-center gap-[4vw] md:flex-row">
        <img src={qr} alt="QR kód pro hlasování" className="size-[min(70vw,38vh)] rounded-[24px] bg-white p-3" />
        <div>
          <p className="text-[clamp(16px,2.2vw,28px)] font-bold tracking-[0.2em] text-ash uppercase">Kód z klubu</p>
          <p className="hw-glow font-mono text-[clamp(64px,13vw,180px)] leading-none font-black tracking-[0.12em] text-bone tabular-nums">
            {row.code.slice(0, 3)}&nbsp;{row.code.slice(3)}
          </p>
          <Countdown changesAt={row.changes_at} />
        </div>
      </div>
      <p className="max-w-3xl text-[clamp(16px,2.2vw,30px)] leading-snug font-semibold">
        Otevři GetCrush, jdi na Soutěž o kostým a opiš kód, nebo naskenuj QR kód foťákem.
      </p>
      <p className="text-[clamp(13px,1.4vw,18px)] text-ash">
        {event.name} · v klubu ověřeno {row.checked_in} lidí
        {off && " · hlasování je teď v administraci vypnuté"}
      </p>
    </main>
  );
}
