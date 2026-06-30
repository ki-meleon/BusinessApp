# Business Manager

Web-App zur Verwaltung von Angeboten (Schulung/Beratung), einem Schulungsinhalte-Katalog mit PPTX-Zusammenstellung, und Kundenmanagement (CRM) mit n8n-Trigger für Angebots-/Rechnungsversand.

Next.js (App Router) + Supabase Cloud (Postgres + Auth) + Nextcloud (WebDAV, PPTX-Speicher) + n8n-Webhook-Integration. Gehostet auf Vercel, geschützt durch Login (Supabase Auth, Single User).

## Erstmaliges Setup

### 1. Supabase Cloud Projekt

1. Account + Projekt auf https://supabase.com anlegen (Free Tier reicht für eine interne Single-User-App; pausiert nach 1 Woche Inaktivität).
2. Projekt verlinken und Migrationen anwenden:
   ```bash
   supabase link --project-ref <project-ref>
   supabase db push
   ```
   Alternativ: SQL-Dateien aus `supabase/migrations/` der Reihe nach im Supabase SQL-Editor ausführen.
3. API-Keys (Settings → API) in `.env.local` eintragen: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
4. Einzigen Nutzer anlegen: Authentication → Users → Add user (E-Mail + Passwort). Keine Self-Signup-UI vorhanden — Login nur mit diesem einen Account.

### 2. Nextcloud (PPTX-Speicher)

1. App-Passwort erzeugen: Nextcloud → Einstellungen → Sicherheit → Geräte & Sitzungen → Neues App-Passwort.
2. In `.env.local` eintragen: `NEXTCLOUD_URL`, `NEXTCLOUD_USERNAME`, `NEXTCLOUD_APP_PASSWORD`, `NEXTCLOUD_PPTX_FOLDER` (z.B. `/BusinessApp/pptx-storage`).
3. Der Ordner wird beim ersten Upload/Merge automatisch angelegt (`topics/`, `generated/` als Unterordner).

### 3. n8n-Webhook

In den Einstellungen der App (`/settings`, nach Login) oder über `.env.local` (`N8N_WEBHOOK_SEND_OFFER`) die Webhook-URL des n8n-Workflows hinterlegen, der "Angebot/Rechnung senden" entgegennimmt. Payload: JSON mit Kunden-/Angebotsdaten und Freitext, oder Multipart mit zusätzlichem `audio`-Feld bei Sprachaufnahme.

### 4. Lokal entwickeln

```bash
npm install
npm run dev
```

Öffne http://localhost:3000 — leitet ohne Session zu `/login` um.

### 5. Deployment auf Vercel

1. Repo auf GitHub pushen (siehe unten).
2. Vercel-Projekt importieren.
3. Alle Variablen aus `.env.example` im Vercel-Projekt (Settings → Environment Variables) für Production setzen.
4. Deploy. Hobby-Plan (10s Funktions-Timeout) reicht für kleine PPTX-Merges — bei größeren/mehreren Dateien ggf. auf Pro upgraden (höheres `maxDuration` in den betroffenen API-Routen anpassen: `src/app/api/pptx/merge/route.ts`, `src/app/api/topics/[id]/upload/route.ts`, `src/app/api/pptx/[filename]/route.ts`).

## Module

- **Angebote** (`/angebote`) — Schulungs- und Beratungspakete, sortierbar, mit Inhalten.
- **Schulungsinhalte** (`/schulungsinhalte`) — Katalog aus Abschnitten/Themen, PPTX-Upload pro Thema (landet in Nextcloud), Builder unter `/schulungsinhalte/build` zum Zusammenstellen mehrerer Themen-PPTs per Drag & Drop (Merge-Ergebnis landet ebenfalls in Nextcloud, Download über Build-Historie).
- **Kundenmanagement** (`/kunden`) — Leads/Aktive/Vergangene Kunden, Notizen, Angebot/Rechnung senden (Text und/oder Sprachaufnahme) via n8n-Webhook.
- **Einstellungen** (`/settings`) — n8n-Webhook-URL, Nextcloud-Speicherort (Anzeige).
- **Login** (`/login`) — Supabase Auth E-Mail/Passwort, alle anderen Routen sind über `middleware.ts` geschützt.

## Architektur-Hinweise

- Datenbankzugriff läuft serverseitig durchgehend über den Supabase Service-Role-Key (`src/lib/supabase/server.ts`), RLS-Policies (`supabase/migrations/*_enable_rls.sql`) sind Defense-in-Depth, nicht die primäre Zugriffskontrolle — die übernimmt `middleware.ts`.
- PPTX-Merge läuft serverless: Quelldateien werden zur Laufzeit von Nextcloud in ein temporäres `/tmp`-Verzeichnis geladen, mit `pptx-automizer` gemergt, das Ergebnis wird nach Nextcloud hochgeladen (`src/lib/pptx/merge.ts`).

## Hinweis zum aktuellen Stand

Code ist vollständig implementiert und durchläuft `npm run build` fehlerfrei. **Noch nicht live getestet**, da reale Supabase-Cloud- und Nextcloud-Zugangsdaten noch fehlten. Nach dem Setup oben (Abschnitte 1–3) den kompletten Flow einmal durchspielen: Login, Kunde anlegen, Thema + PPTX hochladen, mehrere Themen mergen und herunterladen, Angebot/Rechnung mit Sprachaufnahme senden.
