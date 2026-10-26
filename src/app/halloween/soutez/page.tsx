import type { Metadata } from "next";
import { CostumeContestView } from "../../(app)/e/[id]/kostymy/contest";
import type { CostumeContest } from "@/lib/types";
import { EVENT } from "../event";

export const metadata: Metadata = {
  title: { absolute: "Soutěž o nejlepší kostým · ukázka" },
  robots: { index: false, follow: false },
};

// Veřejná ukázka soutěže (bez přihlášení), ať ji jde poslat kolegům: stejná stránka jako v aplikaci,
// ilustrační kostýmy z fotek z akcí GetUp, hlasování se jen přepíná na stránce a nic se neodesílá.
const g = (n: string) => `/halloween/gallery/${n}-800.webp`;
const DEMO: CostumeContest = {
  enabled: true,
  entries_open: true,
  voting_open: true,
  my_entry: { id: "demo-me", title: "Upírka z K2", photo: g("203"), status: "approved" },
  my_vote: "demo-2",
  entries: [
    { id: "demo-1", title: "Smrtka", photo: g("058"), name: "Tereza", mine: false },
    { id: "demo-2", title: "Zombie nevěsta", photo: g("092"), name: "Kuba", mine: false },
    { id: "demo-3", title: "Duo Wednesday", photo: g("113"), name: "Nela", mine: false },
    { id: "demo-4", title: "Joker", photo: g("146"), name: "Matěj", mine: false },
    { id: "demo-5", title: "Čarodějnice", photo: g("218"), name: "Klára", mine: false },
    { id: "demo-me", title: "Upírka z K2", photo: g("203"), name: "Ty", mine: true },
  ],
};

export default function CostumeContestDemoPage() {
  return (
    <main className="relative mx-auto min-h-dvh max-w-md bg-night text-bone">
      <CostumeContestView userId="demo" event={{ id: "demo", name: EVENT.name, venue: "Klub K2, České Budějovice" }} contest={DEMO} demo />
    </main>
  );
}
