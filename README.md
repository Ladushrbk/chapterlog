# ChapterLog

Čtenářský deník v jednom souboru. Knihovna, wishlist, průběh čtení, série,
autoři, postavy, statistiky a rozpočet za knihy.

## Jak to funguje

`index.html` je celá aplikace — HTML, CSS i JavaScript, žádný build, žádné závislosti
kromě knihovny pro přihlašování. Otevřít se dá i lokálně dvojklikem.

Data jsou **local-first**: pravdou je kopie v prohlížeči, do cloudu se odesílá
na pozadí. Appka proto funguje offline a reaguje okamžitě.

| Režim | Kdy | Kde jsou data |
|---|---|---|
| Bez cloudu | `SUPABASE_URL` v `index.html` je prázdný | Jen v prohlížeči |
| Bez účtu | Uživatel klikne „Prohlédnout si to bez účtu" | Jen v prohlížeči |
| S účtem | Uživatel se přihlásí | Prohlížeč + Supabase, sesynchronizované |

Oddělení dat mezi uživateli hlídá Row Level Security přímo v databázi.

## Struktura

```
index.html                              celá aplikace
supabase/schema.sql                     tabulka, RLS, triggery
supabase/functions/delete-account/      smazání účtu (GDPR)
supabase/functions/book-search/         vyhledávání přes Google Books
NASTAVENI.md                            jak to zprovoznit krok za krokem
zasady-ochrany-udaju.md                 koncept zásad, k doplnění
```

## Zprovoznění

Viz [NASTAVENI.md](NASTAVENI.md). Ve zkratce: založit projekt v Supabase,
spustit `schema.sql`, vyplnit dva klíče v `index.html`, nasadit funkce,
nasměrovat doménu na GitHub Pages.

## Vyhledávání knih

Hlavní zdroj je **Open Library** — bez klíče, jde volat rovnou z prohlížeče.
Když tam kniha není a uživatel je přihlášený, doptá se serverová funkce
**Google Books** (zná líp česká vydání). Klíč zůstává na serveru.
