# Talk in Seoul

Hangul class companion for **Pop In Seoul**, a Korean market in Springfield, IL.

Students come to an in-person Hangul class at the store, then use this phone-friendly web app to practice at home between classes. It is a warm, simple companion — not a full learning-management system.

**Talk in Seoul** · Hangul Class @ Pop In Seoul

## What’s in Phase 1

- **Home** — this week’s focus, then three links: Pronunciation, Quiz, This Week
- **Pronunciation** — Week 1 vowels and consonants with Play (Jung’s voice) and Record / Play me
- **Quiz** — flashcards for the 10 basic vowels plus a few starter words (tap to flip)
- **This Week** — placeholder for class materials (PDFs and links later)

Menu is a hamburger in the top-left. English is the primary UI language, with Korean labels where they feel natural. There is no login.

Old `/lesson` and `/practice` URLs go to Pronunciation. `/homework` goes to This Week.

## Run locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`) on your computer or phone.

### Other commands

```bash
npm run build    # production build
npm run preview  # serve the production build
npm run lint     # oxlint
```

Progress (quiz score, homework checks, and the next-class note) is stored only in this browser. Student recordings stay in memory for this visit and are never uploaded.

## Teacher audio (Jung)

Drop additional MP3 files into `public/audio/` using the names below. Keep the same filenames — the app looks them up automatically. If a file is missing, students see **Audio coming soon** instead of a broken player.

The 10 basic vowels already use **Jung’s recordings**. Consonant files are not included yet; those rows already use the same Play/Record UI.

Tap Play / Record on the phone itself (Safari or Chrome). Browsers require a tap to start audio or the microphone.

### Vowels · 모음 → `vowel-{roman}.mp3`

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

### Consonants · 자음 → `consonant-{slug}.mp3`

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

## Out of scope

Payments, store cart, Instagram, booking, user accounts, native App Store / Play Store apps, an admin CMS, AI pronunciation scoring, and cloud upload of student audio.
