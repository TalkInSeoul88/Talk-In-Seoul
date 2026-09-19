# Teacher audio (`public/audio/`)

Play looks up `/audio/{audioId}.mp3`. If a file is missing, the app shows **Audio coming soon** and disables Play. Do not add silent or fake MP3s as placeholders.

## 모음(vowels) → `vowel-{roman}.mp3`

These ten files are Jung’s recordings and must keep these names.

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

## 자음(consonants) → `consonant-{slug}.mp3`

All 14 basic 자음 are Jung’s recordings. Play / Record appear automatically when the matching MP3 is present.

| Hangul | Slug | File |
| --- | --- | --- |
| ㄱ | g | `consonant-g.mp3` |
| ㄴ | n | `consonant-n.mp3` |
| ㄷ | d | `consonant-d.mp3` |
| ㄹ | r | `consonant-r.mp3` |
| ㅁ | m | `consonant-m.mp3` |
| ㅂ | b | `consonant-b.mp3` |
| ㅅ | s | `consonant-s.mp3` |
| ㅇ | ng | `consonant-ng.mp3` |
| ㅈ | j | `consonant-j.mp3` |
| ㅊ | ch | `consonant-ch.mp3` |
| ㅋ | k | `consonant-k.mp3` |
| ㅌ | t | `consonant-t.mp3` |
| ㅍ | p | `consonant-p.mp3` |
| ㅎ | h | `consonant-h.mp3` |

## 음절(syllables) → `syllable-{roman}.mp3`

140 basic CV blocks (14 자음 × 10 모음). None are in the repo yet. Record in order using [SYLLABLE-RECORDING-CHECKLIST.md](./SYLLABLE-RECORDING-CHECKLIST.md).

`audioId` is the filename without `.mp3`. Example: 가 → `syllable-ga` → `syllable-ga.mp3`.

### Romanization map (Revised Romanization)

Initial 자음(consonants) (ㅇ is silent, so 아 is just `a`):

| ㄱ | ㄴ | ㄷ | ㄹ | ㅁ | ㅂ | ㅅ | ㅇ | ㅈ | ㅊ | ㅋ | ㅌ | ㅍ | ㅎ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| g | n | d | r | m | b | s | *(empty)* | j | ch | k | t | p | h |

모음(vowels):

| ㅏ | ㅑ | ㅓ | ㅕ | ㅗ | ㅛ | ㅜ | ㅠ | ㅡ | ㅣ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a | ya | eo | yeo | o | yo | u | yu | eu | i |

Concatenate: ㄱ+ㅏ = `ga`, ㅇ+ㅣ = `i`, ㅎ+ㅕ = `hyeo`.

Do not reuse `vowel-*.mp3` for ㅇ-syllables. `vowel-a.mp3` is the letter ㅏ; `syllable-a.mp3` is the block 아.

Filenames stay ASCII even when the sound palatalizes (시 → `syllable-si.mp3`).
