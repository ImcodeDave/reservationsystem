# Rezervační systém — Zasedačky

Jednoduchý rezervační systém pro 3 zasedací místnosti. React + Supabase + Vercel.

---

## Jak to rozjet (30 minut, zdarma)

### 1. Supabase — databáze

1. Jdi na **supabase.com** a vytvoř si účet (zdarma)
2. Klikni **New project**, pojmenuj ho třeba `zasedacky`
3. Počkej ~2 minuty než se projekt inicializuje
4. Jdi do **SQL Editor** a spusť tento příkaz:

```sql
create table reservations (
  id bigserial primary key,
  date date not null,
  room_id integer not null check (room_id in (1, 2, 3)),
  start_time time not null,
  end_time time not null,
  name text not null,
  created_at timestamptz default now()
);

alter table reservations enable row level security;

create policy "Kdokoliv může číst" on reservations
  for select using (true);

create policy "Kdokoliv může přidávat" on reservations
  for insert with check (true);

create policy "Kdokoliv může upravovat" on reservations
  for update using (true);

create policy "Kdokoliv může mazat" on reservations
  for delete using (true);
```

5. Jdi do **Settings → API** a zkopíruj si:
   - **Project URL** (něco jako `https://abcdef.supabase.co`)
   - **anon public** key (dlouhý string)

---

### 2. GitHub — nahraj kód

1. Jdi na **github.com** a vytvoř nový repozitář (private, prázdný)
2. Nahraj všechny soubory z tohoto projektu
3. Vytvoř soubor `.env` (podle `.env.example`) se svými klíči **ale nepushuj ho na GitHub!**
   - Přidej `.env` do `.gitignore`

---

### 3. Vercel — hosting

1. Jdi na **vercel.com**, přihlas se přes GitHub
2. Klikni **Add New Project**, vyber svůj repozitář
3. Pod **Environment Variables** přidej:
   - `VITE_SUPABASE_URL` → tvoje Project URL ze Supabase
   - `VITE_SUPABASE_ANON_KEY` → tvůj anon key ze Supabase
4. Klikni **Deploy**

Za 1-2 minuty máš webovku na adrese jako `zasedacky.vercel.app`.

---

## Lokální vývoj

```bash
npm install
cp .env.example .env   # vyplň své klíče
npm run dev
```

---

## Přizpůsobení

Chceš změnit názvy místností? Otevři `src/App.jsx` a uprav pole `ROOMS` na začátku souboru:

```js
const ROOMS = [
  { id: 1, name: "Velká konferenční", color: "#1a1a1a" },
  { id: 2, name: "Malá zasedačka", color: "#555" },
  { id: 3, name: "Kreativní studio", color: "#999" },
];
```

---

## Stack

- **React 18** — UI
- **Vite** — build tool
- **Supabase** — databáze (PostgreSQL) + realtime API
- **Vercel** — hosting (zdarma)
