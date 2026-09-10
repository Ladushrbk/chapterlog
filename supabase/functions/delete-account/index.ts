// ChapterLog — smazání účtu (GDPR)
//
// Uživatel klikne v Nastavení na „Smazat účet". Aplikace zavolá tuhle funkci
// se svým přihlašovacím tokenem. Funkce ověří, kdo volá, a smaže jeho účet.
// Řádek v tabulce libraries zmizí sám — má on delete cascade.
//
// Nasazení:  supabase functions deploy delete-account
// (SUPABASE_URL i SUPABASE_SERVICE_ROLE_KEY nastavuje Supabase samo.)

import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Použij POST" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Chybí přihlášení" }, 401);

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Kdo volá? Ověřujeme tokenem, ne tím, co aplikace tvrdí.
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data: userData, error: userErr } = await admin.auth.getUser(token);
  if (userErr || !userData?.user) return json({ error: "Neplatné přihlášení" }, 401);

  const userId = userData.user.id;

  // Data smažeme výslovně, ať to nestojí a nepadá na cascade.
  const { error: delDataErr } = await admin.from("libraries").delete().eq("user_id", userId);
  if (delDataErr) return json({ error: "Data se nepodařilo smazat: " + delDataErr.message }, 500);

  const { error: delUserErr } = await admin.auth.admin.deleteUser(userId);
  if (delUserErr) return json({ error: "Účet se nepodařilo smazat: " + delUserErr.message }, 500);

  return json({ ok: true });
});
