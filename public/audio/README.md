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

Quiz also lists the 5 쌍자음. Drop matching files here when recorded; until then the card still shows and Play says **Audio coming soon**.

| Hangul | Slug | File |
| --- | --- | --- |
| ㄲ | kk | `consonant-kk.mp3` |
| ㄸ | tt | `consonant-tt.mp3` |
| ㅃ | pp | `consonant-pp.mp3` |
| ㅆ | ss | `consonant-ss.mp3` |
| ㅉ | jj | `consonant-jj.mp3` |

## 음절(syllables) → `syllable-{roman}.mp3`

140 basic CV blocks (14 자음 × 10 모음). **All 10 vowel rows are in the repo (140/140).** Recording order: [SYLLABLE-RECORDING-CHECKLIST.md](./SYLLABLE-RECORDING-CHECKLIST.md).

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

### ㅕ row (Jung’s recordings) — 겨녀뎌려며벼셔여져쳐켜텨펴혀

| Hangul | Roman | File |
| --- | --- | --- |
| 겨 | gyeo | `syllable-gyeo.mp3` |
| 녀 | nyeo | `syllable-nyeo.mp3` |
| 뎌 | dyeo | `syllable-dyeo.mp3` |
| 려 | ryeo | `syllable-ryeo.mp3` |
| 며 | myeo | `syllable-myeo.mp3` |
| 벼 | byeo | `syllable-byeo.mp3` |
| 셔 | syeo | `syllable-syeo.mp3` |
| 여 | yeo | `syllable-yeo.mp3` |
| 져 | jyeo | `syllable-jyeo.mp3` |
| 쳐 | chyeo | `syllable-chyeo.mp3` |
| 켜 | kyeo | `syllable-kyeo.mp3` |
| 텨 | tyeo | `syllable-tyeo.mp3` |
| 펴 | pyeo | `syllable-pyeo.mp3` |
| 혀 | hyeo | `syllable-hyeo.mp3` |

### ㅗ row (Jung’s recordings) — 고노도로모보소오조초코토포호

| Hangul | Roman | File |
| --- | --- | --- |
| 고 | go | `syllable-go.mp3` |
| 노 | no | `syllable-no.mp3` |
| 도 | do | `syllable-do.mp3` |
| 로 | ro | `syllable-ro.mp3` |
| 모 | mo | `syllable-mo.mp3` |
| 보 | bo | `syllable-bo.mp3` |
| 소 | so | `syllable-so.mp3` |
| 오 | o | `syllable-o.mp3` |
| 조 | jo | `syllable-jo.mp3` |
| 초 | cho | `syllable-cho.mp3` |
| 코 | ko | `syllable-ko.mp3` |
| 토 | to | `syllable-to.mp3` |
| 포 | po | `syllable-po.mp3` |
| 호 | ho | `syllable-ho.mp3` |

### ㅛ row (Jung’s recordings) — 교뇨됴료묘뵤쇼요죠쵸쿄툐표효

| Hangul | Roman | File |
| --- | --- | --- |
| 교 | gyo | `syllable-gyo.mp3` |
| 뇨 | nyo | `syllable-nyo.mp3` |
| 됴 | dyo | `syllable-dyo.mp3` |
| 료 | ryo | `syllable-ryo.mp3` |
| 묘 | myo | `syllable-myo.mp3` |
| 뵤 | byo | `syllable-byo.mp3` |
| 쇼 | syo | `syllable-syo.mp3` |
| 요 | yo | `syllable-yo.mp3` |
| 죠 | jyo | `syllable-jyo.mp3` |
| 쵸 | chyo | `syllable-chyo.mp3` |
| 쿄 | kyo | `syllable-kyo.mp3` |
| 툐 | tyo | `syllable-tyo.mp3` |
| 표 | pyo | `syllable-pyo.mp3` |
| 효 | hyo | `syllable-hyo.mp3` |

### ㅜ row (Jung’s recordings) — 구누두루무부수우주추쿠투푸후

| Hangul | Roman | File |
| --- | --- | --- |
| 구 | gu | `syllable-gu.mp3` |
| 누 | nu | `syllable-nu.mp3` |
| 두 | du | `syllable-du.mp3` |
| 루 | ru | `syllable-ru.mp3` |
| 무 | mu | `syllable-mu.mp3` |
| 부 | bu | `syllable-bu.mp3` |
| 수 | su | `syllable-su.mp3` |
| 우 | u | `syllable-u.mp3` |
| 주 | ju | `syllable-ju.mp3` |
| 추 | chu | `syllable-chu.mp3` |
| 쿠 | ku | `syllable-ku.mp3` |
| 투 | tu | `syllable-tu.mp3` |
| 푸 | pu | `syllable-pu.mp3` |
| 후 | hu | `syllable-hu.mp3` |

### ㅠ row (Jung’s recordings) — 규뉴듀류뮤뷰슈유쥬츄큐튜퓨휴

| Hangul | Roman | File |
| --- | --- | --- |
| 규 | gyu | `syllable-gyu.mp3` |
| 뉴 | nyu | `syllable-nyu.mp3` |
| 듀 | dyu | `syllable-dyu.mp3` |
| 류 | ryu | `syllable-ryu.mp3` |
| 뮤 | myu | `syllable-myu.mp3` |
| 뷰 | byu | `syllable-byu.mp3` |
| 슈 | syu | `syllable-syu.mp3` |
| 유 | yu | `syllable-yu.mp3` |
| 쥬 | jyu | `syllable-jyu.mp3` |
| 츄 | chyu | `syllable-chyu.mp3` |
| 큐 | kyu | `syllable-kyu.mp3` |
| 튜 | tyu | `syllable-tyu.mp3` |
| 퓨 | pyu | `syllable-pyu.mp3` |
| 휴 | hyu | `syllable-hyu.mp3` |

### ㅡ row (Jung’s recordings) — 그느드르므브스으즈츠크트프흐

| Hangul | Roman | File |
| --- | --- | --- |
| 그 | geu | `syllable-geu.mp3` |
| 느 | neu | `syllable-neu.mp3` |
| 드 | deu | `syllable-deu.mp3` |
| 르 | reu | `syllable-reu.mp3` |
| 므 | meu | `syllable-meu.mp3` |
| 브 | beu | `syllable-beu.mp3` |
| 스 | seu | `syllable-seu.mp3` |
| 으 | eu | `syllable-eu.mp3` |
| 즈 | jeu | `syllable-jeu.mp3` |
| 츠 | cheu | `syllable-cheu.mp3` |
| 크 | keu | `syllable-keu.mp3` |
| 트 | teu | `syllable-teu.mp3` |
| 프 | peu | `syllable-peu.mp3` |
| 흐 | heu | `syllable-heu.mp3` |

### ㅣ row (Jung’s recordings) — 기니디리미비시이지치키티피히

| Hangul | Roman | File |
| --- | --- | --- |
| 기 | gi | `syllable-gi.mp3` |
| 니 | ni | `syllable-ni.mp3` |
| 디 | di | `syllable-di.mp3` |
| 리 | ri | `syllable-ri.mp3` |
| 미 | mi | `syllable-mi.mp3` |
| 비 | bi | `syllable-bi.mp3` |
| 시 | si | `syllable-si.mp3` |
| 이 | i | `syllable-i.mp3` |
| 지 | ji | `syllable-ji.mp3` |
| 치 | chi | `syllable-chi.mp3` |
| 키 | ki | `syllable-ki.mp3` |
| 티 | ti | `syllable-ti.mp3` |
| 피 | pi | `syllable-pi.mp3` |
| 히 | hi | `syllable-hi.mp3` |

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
