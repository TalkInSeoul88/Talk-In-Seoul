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

ㄱ ㄴ ㄷ ㄹ ㅁ ㅂ are Jung’s recordings. The rest are not recorded yet — those rows stay **Audio coming soon**. When more files exist, Play / Record appear automatically.

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

140 basic CV blocks (14 자음 × 10 모음). **ㅏ + ㅑ + ㅓ rows are in the repo (42/140).** Other vowel columns stay **Audio coming soon**. Record the rest in order using [SYLLABLE-RECORDING-CHECKLIST.md](./SYLLABLE-RECORDING-CHECKLIST.md). Do not merge to production until all 140 are ready.

`audioId` is the filename without `.mp3`. Example: 가 → `syllable-ga` → `syllable-ga.mp3`.

### ㅏ row (Jung’s recordings) — 가나다라마바사아자차카타파하

| Hangul | Roman | File |
| --- | --- | --- |
| 가 | ga | `syllable-ga.mp3` |
| 나 | na | `syllable-na.mp3` |
| 다 | da | `syllable-da.mp3` |
| 라 | ra | `syllable-ra.mp3` |
| 마 | ma | `syllable-ma.mp3` |
| 바 | ba | `syllable-ba.mp3` |
| 사 | sa | `syllable-sa.mp3` |
| 아 | a | `syllable-a.mp3` |
| 자 | ja | `syllable-ja.mp3` |
| 차 | cha | `syllable-cha.mp3` |
| 카 | ka | `syllable-ka.mp3` |
| 타 | ta | `syllable-ta.mp3` |
| 파 | pa | `syllable-pa.mp3` |
| 하 | ha | `syllable-ha.mp3` |

### ㅑ row (Jung’s recordings) — 갸냐댜랴먀뱌샤야쟈챠캬탸퍄햐

| Hangul | Roman | File |
| --- | --- | --- |
| 갸 | gya | `syllable-gya.mp3` |
| 냐 | nya | `syllable-nya.mp3` |
| 댜 | dya | `syllable-dya.mp3` |
| 랴 | rya | `syllable-rya.mp3` |
| 먀 | mya | `syllable-mya.mp3` |
| 뱌 | bya | `syllable-bya.mp3` |
| 샤 | sya | `syllable-sya.mp3` |
| 야 | ya | `syllable-ya.mp3` |
| 쟈 | jya | `syllable-jya.mp3` |
| 챠 | chya | `syllable-chya.mp3` |
| 캬 | kya | `syllable-kya.mp3` |
| 탸 | tya | `syllable-tya.mp3` |
| 퍄 | pya | `syllable-pya.mp3` |
| 햐 | hya | `syllable-hya.mp3` |

### ㅓ row (Jung’s recordings) — 거너더러머버서어저처커터퍼허

| Hangul | Roman | File |
| --- | --- | --- |
| 거 | geo | `syllable-geo.mp3` |
| 너 | neo | `syllable-neo.mp3` |
| 더 | deo | `syllable-deo.mp3` |
| 러 | reo | `syllable-reo.mp3` |
| 머 | meo | `syllable-meo.mp3` |
| 버 | beo | `syllable-beo.mp3` |
| 서 | seo | `syllable-seo.mp3` |
| 어 | eo | `syllable-eo.mp3` |
| 저 | jeo | `syllable-jeo.mp3` |
| 처 | cheo | `syllable-cheo.mp3` |
| 커 | keo | `syllable-keo.mp3` |
| 터 | teo | `syllable-teo.mp3` |
| 퍼 | peo | `syllable-peo.mp3` |
| 허 | heo | `syllable-heo.mp3` |

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
