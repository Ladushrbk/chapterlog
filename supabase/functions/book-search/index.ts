// ChapterLog — vyhledávání knih přes Google Books
//
// Proč přes server a ne rovnou z prohlížeče: Google Books od roku 2025 vyžaduje
// API klíč. Kdyby byl klíč v index.html, přečte si ho každý a vyčerpá kvótu.
// Takhle je klíč jen tady a volat to smí jen přihlášený uživatel.
//
// Nasazení:
//   supabase secrets set GOOGLE_BOOKS_KEY=AIza...
//   supabase functions deploy book-search
//
// Bez nastaveného klíče funkce slušně odpoví "nemám klíč" a aplikace
// zůstane u Open Library — nic se nerozbije.

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

const LANG: Record<string, string> = { cs: "Čeština", en: "Angličtina" };

function mapVolume(v: Record<string, any>) {
  if (!v) return null;
  const img = v.imageLinks ?? {};
  const cover = String(img.thumbnail ?? img.smallThumbnail ?? "")
    .replace(/^http:/, "https:")
    .replace(/&edge=curl/, "");
  const year = String(v.publishedDate ?? "").slice(0, 4);
  return {
    title: v.title ? (v.subtitle ? `${v.title}: ${v.subtitle}` : v.title) : "",
    author: (v.authors ?? []).join(", "),
    publisher: v.publisher ?? "",
    year: /^\d{4}$/.test(year) ? +year : 0,
    pages: +v.pageCount || 0,
    lang: LANG[v.language] ?? (v.language ? "Jiný" : ""),
    cover,
    summary: String(v.description ?? "").replace(/<[^>]*>/g, "").slice(0, 600),
    categories: v.categories ?? [],
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Použij POST" }, 405);

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "Chybí přihlášení" }, 401);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );
  const { data: userData } = await admin.auth.getUser(token);
  if (!userData?.user) return json({ error: "Neplatné přihlášení" }, 401);

  const key = Deno.env.get("GOOGLE_BOOKS_KEY");
  if (!key) return json({ results: [], note: "Google Books není nastavený" });

  let q = "";
  try {
    q = String(((await req.json()) ?? {}).q ?? "").trim();
  } catch { /* prázdné tělo */ }
  if (q.length < 2) return json({ error: "Zadej aspoň dvě písmena" }, 400);
  if (q.length > 200) q = q.slice(0, 200);

  const isbn = q.replace(/[-\s]/g, "");
  const query = /^\d{10}(\d{3})?$/.test(isbn) ? "isbn:" + isbn : q;
  const url =
    "https://www.googleapis.com/books/v1/volumes?maxResults=6&country=CZ" +
    "&key=" + encodeURIComponent(key) +
    "&q=" + encodeURIComponent(query);

  try {
    const r = await fetch(url);
    const d = await r.json();
    if (d.error) return json({ results: [], note: d.error.message ?? d.error.code });
    const results = (d.items ?? [])
      .map((it: Record<string, any>) => mapVolume(it.volumeInfo))
      .filter((b: Record<string, any> | null) => b && b.title);
    return json({ results, source: "Google Books" });
  } catch (e) {
    return json({ results: [], note: "Google Books neodpověděl: " + (e as Error).message });
  }
});
