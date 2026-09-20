# Talk in Seoul

Hangul class companion for **Pop In Seoul**, a Korean market in Springfield, IL.

Students come to an in-person Hangul class at the store, then use this phone-friendly web app to practice at home between classes. It is a warm, simple companion — not a full learning-management system.

**Talk in Seoul** · Hangul Class @ Pop In Seoul

## What’s in this version

- **Home** — this week’s focus, an access-code box, then links: Pronunciation, Quiz, This Week
- **Pronunciation** — **모음(vowels)** (Jung’s audio + Record / Play me) and **자음(consonants)** are free. All 14 자음 have teacher clips. **음절(syllables)** is the full 140 CV chart; Play / Record need a class access code. All 10 vowel rows (ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ, 140/140) have teacher clips.
- **Quiz** — flashcards for the 10 basic vowels plus a few starter words (tap to flip)
- **This Week** — public writing sheets (no access code): 자음 (`/materials/hangul-consonant-practice.pdf`) and 모음 (`/materials/hangul-vowel-practice.pdf`). Word writing (단어) is under Class materials and unlocks with a class access code.
- **Admin** (`/admin`) — hidden from the student hamburger. Jung unlocks with a password, then issues / lists / starts / stops access codes with an expiry date

Menu is a hamburger in the top-left. English is the primary UI language, with Korean labels where they feel natural. Students do **not** create an account. Without a code they can still use the free app.

Old `/lesson` and `/practice` URLs go to Pronunciation. `/homework` goes to This Week.

## Run locally

```bash
npm install
cp .env.example .env.local
# set ADMIN_PASSWORD in .env.local
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`) on your computer or phone.

Local issued codes are saved to `.data/access-codes.json` (gitignored) so you can test without Vercel Blob.

### Other commands

```bash
npm run build    # production build
npm run preview  # serve the production build
npm run lint     # oxlint
npm test         # access-code helpers
```

Student enrollment is remembered in this browser (`localStorage`). Issued codes are **not** stored only on the phone — they live in Vercel Blob in production, or `.data/` locally. Student recordings stay in memory for this visit and are never uploaded.

## Admin password (Jung)

The password is **never** shipped to the browser. The app checks it on the server.

### Set it on Vercel

1. Open the Talk in Seoul project on Vercel.
2. Go to **Settings → Environment Variables**.
3. Add `ADMIN_PASSWORD` with a long password only you know.
4. Apply it to **Production** and **Preview**.
5. Redeploy so `/api/admin/login` picks it up: Vercel → Deployments → ⋯ on Production → **Redeploy** (or merge this repo’s next PR). Do not skip the redeploy; env vars are applied at function boot.

Wrong password returns **401 JSON**. If `ADMIN_PASSWORD` is missing, the function returns **503 JSON** instead of crashing.

Optional: also set `ADMIN_SESSION_SECRET` to a random string. If you skip it, the admin session key is derived from `ADMIN_PASSWORD`.

Then visit `https://talk-in-seoul.vercel.app/admin` (this URL is not in the student menu). Unlock, create a code, set the expiry, and use **On / Off** to start or stop it.

### Local

In `.env.local`:

```
ADMIN_PASSWORD=your-password
```

Do not prefix this with `VITE_`. That would copy the password into the client bundle.

## Vercel `/api` functions

This is a Vite SPA plus serverless files under `/api`. Production login is `api/admin/login.js`: a Node.js handler with **no relative imports**, so Vercel does not have to bundle `api/_lib`. Wrong password → 401 JSON. Missing `ADMIN_PASSWORD` → 503 JSON.

`vercel.json` keeps SPA fallback for student routes (not `/api`, `/materials`, or `/audio`) and tells Vercel to ship `api/_lib/**` with the codes/redeem functions:

```json
{
  "rewrites": [{ "source": "/((?!api/|materials/|audio/).*)", "destination": "/index.html" }],
  "functions": {
    "api/admin/*.js": { "includeFiles": "api/_lib/**" },
    "api/access/*.js": { "includeFiles": "api/_lib/**" }
  }
}
```

`package.json` has `"type": "module"` so these `.js` files are ESM. After this fix is on `main`, Vercel should auto-deploy; if not, Redeploy Production.

## Durable store for issued codes (Vercel Blob)

Access codes must survive deploys. This app stores them as one JSON file in **Vercel Blob** — not in student `localStorage`.

1. Vercel dashboard → the Talk in Seoul project → **Storage** → **Create Database** → **Blob**.
2. Choose **Private** access if you can. If the store is public-only, also add env `BLOB_ACCESS=public`.
3. Connect the store to this project for **Production** and **Preview**.
4. Vercel injects `BLOB_STORE_ID` (OIDC on Vercel) and/or `BLOB_READ_WRITE_TOKEN`. You can also paste `BLOB_READ_WRITE_TOKEN` yourself under Environment Variables.

After that, codes Jung creates on `/admin` persist across deploys. Students redeem a code on Home; a valid, active, unexpired code marks that phone as enrolled.

See `.env.example` for the full list.

## Teacher audio (Jung)

Drop additional MP3 files into `public/audio/` using the names below. Keep the same filenames — the app looks them up automatically. If a file is missing, students see **Audio coming soon** instead of a broken player.

The 10 basic vowels, all 14 consonants, and all 140 음절(syllables) already use **Jung’s recordings**.

Tap Play / Record on the phone itself (Safari or Chrome). Browsers require a tap to start audio or the microphone.

### 모음(vowels) → `vowel-{roman}.mp3`

| Hangul | Roman | File |
| --- | --- | --- |
| ㅏ | a | `vowel-a.mp3` |
| ㅑ | ya | `vowel-ya.mp3` |
| ㅓ | eo | `vowel-eo.mp3` |
| ㅕ | yeo | `vowel-yeo.mp3` |
| ㅗ | o | `vowel-o.mp3` |
| ㅛ | yo | `vowel-yo.mp3` |
| ㅜ | u | `vowel-u.mp3` |
| ㅠ | yu | `vowel-yu.mp3` |
| ㅡ | eu | `vowel-eu.mp3` |
| ㅣ | i | `vowel-i.mp3` |

### 자음(consonants) → `consonant-{slug}.mp3`

| Hangul | Roman | File |
| --- | --- | --- |
| ㄱ | g/k | `consonant-g.mp3` |
| ㄴ | n | `consonant-n.mp3` |
| ㄷ | d/t | `consonant-d.mp3` |
| ㄹ | r/l | `consonant-r.mp3` |
| ㅁ | m | `consonant-m.mp3` |
| ㅂ | b/p | `consonant-b.mp3` |
| ㅅ | s | `consonant-s.mp3` |
| ㅇ | (silent) / ng | `consonant-ng.mp3` |
| ㅈ | j | `consonant-j.mp3` |
| ㅊ | ch | `consonant-ch.mp3` |
| ㅋ | k | `consonant-k.mp3` |
| ㅌ | t | `consonant-t.mp3` |
| ㅍ | p | `consonant-p.mp3` |
| ㅎ | h | `consonant-h.mp3` |

After replacing files, refresh the site (or redeploy). No code change is required.

### 음절(syllables) → `syllable-{roman}.mp3`

14 basic 자음(consonants) × 10 basic 모음(vowels) = **140** files. Record them in ㄱ→ㅎ row order. The app looks up `public/audio/syllable-{roman}.mp3`. Example: 가 → `syllable-ga.mp3`.

Romanization map and drop-in steps: [`public/audio/README.md`](public/audio/README.md).  
Jung’s recording list (all 140 filenames + Hangul): [`public/audio/SYLLABLE-RECORDING-CHECKLIST.md`](public/audio/SYLLABLE-RECORDING-CHECKLIST.md).

Initials: ㄱ g · ㄴ n · ㄷ d · ㄹ r · ㅁ m · ㅂ b · ㅅ s · ㅇ silent · ㅈ j · ㅊ ch · ㅋ k · ㅌ t · ㅍ p · ㅎ h.

Vowels (same as above): a ya eo yeo o yo u yu eu i.

ㅇ + ㅏ is `syllable-a.mp3` (the block 아), not `vowel-a.mp3` (the letter ㅏ).

## Out of scope

Payments / Stripe, store cart, Instagram, booking, email signup, native App Store / Play Store apps, a full CMS, AI pronunciation scoring, cloud upload of student audio, PDF upload, Google Docs, and hard 20/20 free gates.
