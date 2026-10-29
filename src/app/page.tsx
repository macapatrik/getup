import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { isComingSoon } from "@/lib/config";
import { themeMetadata, themeViewport } from "@/lib/halloween-meta";
import { Landing } from "./landing";

export const generateMetadata = () => themeMetadata();
export const generateViewport = themeViewport;

export default async function Home() {
  if (await getUser()) redirect("/events");
  return <Landing comingSoon={isComingSoon()} />;
}
