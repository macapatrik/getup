import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { isComingSoon } from "@/lib/config";
import { themeMetadata, themeViewport } from "@/lib/halloween-meta";
import { isHalloween } from "@/lib/theme";
import { ContestLanding } from "./contest-landing";
import { EVENT as HALLOWEEN_EVENT } from "./halloween/event";
import { Landing } from "./landing";

export const generateMetadata = () => themeMetadata();
export const generateViewport = themeViewport;

export default async function Home() {
  // Halloweenská adresa je jen soutěž o kostým: přihlášené rovnou do soutěže, ostatním její úvod.
  if (await isHalloween()) {
    if (await getUser()) redirect(`/e/${HALLOWEEN_EVENT.eventId}/kostymy`);
    return <ContestLanding />;
  }
  if (await getUser()) redirect("/events");
  return <Landing comingSoon={isComingSoon()} />;
}
