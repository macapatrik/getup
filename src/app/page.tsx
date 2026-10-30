import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { isComingSoon } from "@/lib/config";
import { themeMetadata, themeViewport } from "@/lib/halloween-meta";
import { isHalloween } from "@/lib/theme";
import { CONTEST_START, ContestLanding } from "./contest-landing";
import { Landing } from "./landing";

export const generateMetadata = () => themeMetadata();
export const generateViewport = themeViewport;

export default async function Home() {
  // Halloweenská adresa je jen soutěž o kostým: přihlášené rovnou do soutěže, ostatním její úvod.
  if (await isHalloween()) {
    if (await getUser()) redirect(CONTEST_START);
    return <ContestLanding />;
  }
  if (await getUser()) redirect("/events");
  return <Landing comingSoon={isComingSoon()} />;
}
