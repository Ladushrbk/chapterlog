# Jak ChapterLog pustit ven

Dokud jsou v `index.html` prázdné `SUPABASE_URL` a `SUPABASE_ANON_KEY`, appka běží
přesně jako dřív — bez přihlašování, data jen v prohlížeči. Nic se nerozbije,
i kdybys skončila v půlce téhle příručky.

---

## 1. Založit projekt v Supabase

1. [supabase.com](https://supabase.com) → **New project**
2. Region **Frankfurt (eu-central-1)** — nejblíž k českým uživatelům a data zůstanou v EU.
3. Databázové heslo si někam ulož, budeš ho potřebovat u CLI.

Po založení jdi do **Project Settings → API** a zkopíruj:

| Co | Kam v `index.html` |
|---|---|
| Project URL | `const SUPABASE_URL = '…'` |
| anon / public key | `const SUPABASE_ANON_KEY = '…'` |

**Ten `anon` klíč patří do kódu a je veřejný — to je v pořádku.** Sám o sobě
neumožní přečíst cizí data, o to se stará Row Level Security z dalšího kroku.
Co se do kódu nikdy nesmí dostat, je klíč `service_role`.

## 2. Vytvořit tabulku

Supabase → **SQL Editor → New query** → vlož celý obsah `supabase/schema.sql` → **Run**.

Skript se dá spustit i opakovaně. Vznikne tabulka `libraries`, pravidla RLS,
kontrola velikosti a trigger, který novému uživateli založí prázdný řádek.

**Ověření, že RLS opravdu drží:** Table Editor → `libraries` → u tabulky musí
svítit *RLS enabled*. Pak si klidně založ dva testovací účty a zkus, že jeden
nevidí knihy druhého.

## 3. Nastavit přihlašování

**Authentication → URL Configuration**

- *Site URL*: adresa, kde appka poběží (např. `https://chapterlog.cz`)
- *Redirect URLs*: přidej i `https://ladushrbk.github.io/chapterlog/`
  a pro testování `http://localhost:*`

**Authentication → Providers → Email**

- *Confirm email* nech **zapnuté** — jinak si kdokoli založí účet na cizí e-mail.
- Minimální délku hesla nastav na 8 (aplikace to hlídá i sama).

**Authentication → Providers → Google**

1. V [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   → *Create credentials → OAuth client ID → Web application*
2. Do *Authorized redirect URIs* vlož adresu, kterou ti Supabase ukáže
   přímo u Google provideru (končí na `/auth/v1/callback`).
3. Client ID a Client Secret vlož zpátky do Supabase a ulož.

Pokud Google zatím nechceš, nech provider vypnutý — tlačítko pak jen vypíše chybu,
takže ho v `index.html` radši schovej (`id="gateGoogle"` → `style="display:none"`).

**Authentication → Emails**: přelož si aspoň potvrzovací e-mail a obnovu hesla do češtiny.
Vestavěný odesílatel má nízký limit a chodí do spamu — než to pustíš mezi lidi,
připoj vlastní SMTP (Resend, Postmark, SendGrid) v *Project Settings → Auth → SMTP*.

## 4. Nasadit serverové funkce

Potřebuješ [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
npx supabase login
npx supabase link --project-ref <ref z URL projektu>

# mazání účtu (GDPR) — povinné, jakmile appka poběží veřejně
npx supabase functions deploy delete-account

# vyhledávání přes Google Books — nepovinné
npx supabase secrets set GOOGLE_BOOKS_KEY=AIza...
npx supabase functions deploy book-search
```

Bez `book-search` appka hledá jen v Open Library a nic nehlásí.
Bez `delete-account` nebude fungovat tlačítko „Smazat účet".

Klíč na Google Books získáš v Google Cloud Console → *Create credentials → API key*,
a u něj povolíš **Books API**. Zdarma, 1 000 dotazů denně. Teď je schovaný na serveru,
takže ho stačí jeden pro všechny uživatele.

## 5. Doména

GitHub Pages umí vlastní doménu i s HTTPS zdarma a deploy zůstane `git push`.

1. U registrátora domény přidej DNS záznam:
   - `CNAME` pro `www` → `ladushrbk.github.io`
   - pro doménu bez `www` čtyři `A` záznamy na
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
2. GitHub → repozitář → **Settings → Pages → Custom domain** → vlož doménu
3. Počkej, až se objeví **Enforce HTTPS**, a zaškrtni to.
4. Vrať se do Supabase a doménu dopiš do *Site URL* i *Redirect URLs*.

Active24 hosting kvůli tomuhle nepotřebuješ — hodil by se, až bys chtěla data v ČR
a vlastní API místo Supabase.

## 6. Přenést vlastní knihovnu

1. **Ještě než cokoli nasadíš:** otevři appku a klikni na **⬇ Záloha**. Ten soubor si schovej.
2. Po nasazení se přihlas svým účtem.
3. Appka najde knihovnu, co máš v prohlížeči, a sama se zeptá, jestli ji má nahrát do účtu.
4. Kdyby se nezeptala (jiný prohlížeč, jiný počítač), použij **⬆ Obnovit** a nahraj zálohu ze zálohy.

Google Sheet už appka nepoužívá. Sheet i Apps Script nech, dokud si neověříš,
že v cloudu sedí všechny knihy.

---

## Co ještě zbývá, než to pustíš mezi lidi

- [ ] **Zásady ochrany osobních údajů** — viz `zasady-ochrany-udaju.md`, je to koncept k doplnění.
- [ ] **Vlastní SMTP** v Supabase, jinak potvrzovací e-maily skončí ve spamu.
- [ ] **Úvodní stránka** — kdo appku nezná, přistane rovnou na přihlášení a neví, co to je.
- [ ] **Vyzkoušet si to jako cizí člověk** — nový účet v anonymním okně, projít
      registraci, potvrzovací e-mail, přidání knihy, odhlášení, návrat, mazání účtu.
- [ ] **Prázdný stav** — nová knihovna je teď prázdná stránka. Pomohla by věta a šipka
      na „+ Přidat knihu".

## Když něco nefunguje

V appce je ⚙️ **Nastavení → Diagnostika připojení**. Vypíše, jestli odpovídá
Open Library, jestli se navázalo spojení s cloudem, kolik knih v něm je
a kdy se naposledy ukládalo.

Nejčastější zádrhely:

| Příznak | Příčina |
|---|---|
| Po přihlášení přes Google se to vrátí na přihlášení | Adresa není v *Redirect URLs* |
| „E-mail ještě není potvrzený" | Potvrzovací e-mail spadl do spamu → vlastní SMTP |
| Pruh „Knihovna se mezitím změnila" | Psala jsi na dvou zařízeních naráz. Vyber, která verze platí — je to funkce, ne chyba. |
| Stav v hlavičce svítí červeně | Výpadek sítě. Data jsou pořád v prohlížeči a odešlou se, až bude signál. |
