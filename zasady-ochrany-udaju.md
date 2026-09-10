# Zásady ochrany osobních údajů — KONCEPT

> **Tohle je pracovní podklad, ne právní rada.** Doplň hranaté závorky a před
> spuštěním to nech projít někým, kdo se v GDPR opravdu vyzná. Já ti můžu říct,
> co appka technicky dělá s daty — ne jestli je text právně v pořádku.

---

## Kdo data zpracovává

[Jméno / firma], [adresa], kontakt: [e-mail].

## Jaké údaje ChapterLog sbírá

**Při registraci**

- e-mailová adresa (přihlašování, obnova hesla, potvrzení účtu)
- heslo — ukládá se jen jako nevratný otisk, nikdo ho nevidí ani nemůže přečíst
- při přihlášení přes Google navíc jméno a profilová fotka z účtu Google

**Co si do appky sám uložíš**

- knihy, autoři, hodnocení, recenze, poznámky, citace, ceny, data čtení
- nastavení (jméno, měna, motiv, čtenářské cíle)

Nic z toho není povinné a nic se nesbírá na pozadí. Appka nemá analytiku,
nesleduje chování ani nepoužívá reklamní cookies.

## Proč

- **Plnění smlouvy** (čl. 6 odst. 1 písm. b GDPR) — bez e-mailu a hesla by účet nešel provozovat.
- Údaje o knihách jsou obsah, který si tam ukládáš sám pro sebe.

## Komu se data dostanou

- **[Supabase Inc.]** — hostitel databáze a přihlašování, servery v EU (Frankfurt).
  Vystupuje jako zpracovatel.
- **[GitHub, Inc.]** — hosting samotné stránky. Vidí jen běžné údaje o návštěvě
  (IP adresa, typ prohlížeče), ne obsah tvé knihovny.
- **Open Library** a **Google Books** — když hledáš knihu, odejde tam jen ten
  hledaný text. Ne to, co máš v knihovně, ani kdo jsi.

Data se nikomu neprodávají a nepředávají na marketing.

## Jak dlouho

Dokud máš účet. Po smazání účtu mizí knihovna i přihlašovací údaje
bez zbytečného odkladu a nevratně.

## Tvoje práva

- **Přístup a přenositelnost** — ⚙️ Nastavení → ⬇ Záloha stáhne úplně všechna
  tvoje data jako soubor JSON. Bez ptaní, kdykoli.
- **Oprava** — cokoli si v appce přepiš.
- **Výmaz** — ⚙️ Nastavení → 🗑 Smazat účet. Smaže účet i data hned a nastálo.
- **Námitka a stížnost** — obrať se na [e-mail], případně na
  Úřad pro ochranu osobních údajů (uoou.cz).

## Cookies a úložiště prohlížeče

ChapterLog nepoužívá reklamní ani analytické cookies. V prohlížeči si drží:

- **přihlašovací token** — abys nemusela zadávat heslo pokaždé znovu
- **kopii knihovny** (localStorage) — aby appka fungovala i offline a byla rychlá

Obojí je nutné pro chod služby a odhlášením se to smaže.

## Bezpečnost

Data jednotlivých uživatelů odděluje databáze sama (Row Level Security), ne
aplikační kód — jeden uživatel se k datům druhého nedostane ani při chybě
v appce. Spojení jde vždy přes HTTPS.

## Změny

Datum poslední úpravy: [datum]. O podstatných změnách dáme vědět e-mailem.
