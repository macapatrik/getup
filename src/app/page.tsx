import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { isComingSoon } from "@/lib/config";
import { Landing } from "./landing";

export default async function Home() {
  if (await getUser()) redirect("/events");
  return <Landing comingSoon={isComingSoon()} />;
}
