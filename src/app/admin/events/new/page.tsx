import type { Metadata } from "next";
import { card } from "@/components/ui";
import { requireOrganizer } from "@/lib/auth";
import { createEventAction } from "../../actions";
import { EventForm } from "../../event-form";
import { PageHeader } from "../../ui";

export const metadata: Metadata = { title: "Nová akce" };

export default async function NewEventPage() {
  await requireOrganizer();
  return (
    <>
      <PageHeader title="Nová akce" subtitle="Po založení dostaneš QR kód k vytištění." back={{ href: "/admin/events", label: "Akce" }} />
      <section className={`${card} max-w-2xl`}>
        <EventForm action={createEventAction} submitLabel="Založit a vygenerovat QR" pendingText="Zakládám…" />
      </section>
    </>
  );
}
