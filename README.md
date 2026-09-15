# Talk in Seoul

Hangul class companion for **Pop In Seoul**, a Korean market in Springfield, IL.

Students come to an in-person Hangul class at the store, then use this phone-friendly web app to practice at home between classes. It is a warm, simple companion — not a full learning-management system.

**Talk in Seoul** · Hangul Class @ Pop In Seoul

## What’s in the MVP

- **Home** — welcome, this week’s lesson, next class (editable), and progress (last quiz + homework)
- **Lesson review** — Week 1 Hangul basics: vowels, consonants, syllable blocks, and starter words
- **Practice** — tap the correct 자모 (letter) for a romanization or sound cue; instant feedback
- **Quiz** — eight questions with a score at the end and retry
- **Homework** — five “before next class” tasks that persist in the browser (`localStorage`)

English is the primary UI language, with Korean labels where they feel natural. There is no login.

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

Progress (quiz score, homework checks, and the next-class note) is stored only in this browser.

## Out of scope

Payments, store cart, Instagram, booking, user accounts, native App Store / Play Store apps, and an admin CMS.
