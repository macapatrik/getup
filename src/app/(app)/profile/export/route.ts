import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

// Stažení všech mých dat (GDPR) jako JSON.
export async function GET() {
  if (!(await getUser())) return new Response(null, { status: 401 });

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("export_my_data");
  if (error) return new Response("Export se nepovedl, zkus to prosím znovu.", { status: 500 });

  const date = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="gettogether-moje-data-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
