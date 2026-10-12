export type SoundClip = {
  hangul: string
  roman: string
  english: string
  audioId: string
}

export type LadderRung = {
  id: string
  title: string
  tip: string
  clips: SoundClip[]
}

export type ListenSet = {
  id: string
  title: string
  choices: SoundClip[]
}

/** ㄹ tap ladder from the Level 1 guide. 물 reuses Jung’s batchim clip. */
export const RIEUL_LADDER: LadderRung[] = [
  {
    id: 'spot',
    title: 'Find the spot',
    tip: 'Tap once, like the tt in a fast American “butter.” Same spot for 다 (dah) and ㄹ (reu), only lighter. Not a curled r.',
    clips: [
      { hangul: '다다다', roman: 'dah-dah-dah', english: 'Find the spot', audioId: 'sound-dah-dah-dah' },
      { hangul: '라라라', roman: 'rah-rah-rah', english: 'Same spot, lighter', audioId: 'sound-rah-rah-rah' },
    ],
  },
  {
    id: 'between',
    title: 'Between vowels',
    tip: 'One quick tap between the vowels, then let go.',
    clips: [
      { hangul: '나라', roman: 'nah-rah', english: 'country', audioId: 'sound-nah-rah' },
      { hangul: '다리', roman: 'dah-ree', english: 'leg', audioId: 'sound-dah-ree' },
    ],
  },
  {
    id: 'bottom',
    title: 'Bottom ㄹ',
    tip: 'At the bottom of a block, ㄹ (reu) / (ri-eul) is a clean l, like 물 (mool). Tongue up behind the top teeth and stay, like the end of “pool.”',
    clips: [
      { hangul: '물', roman: 'mool', english: 'water', audioId: 'batchim-mul' },
      { hangul: '발', roman: 'bahl', english: 'foot', audioId: 'sound-bahl' },
    ],
  },
  {
    id: 'flip',
    title: 'Flip it',
    tip: 'The bottom l slides into the next block and becomes a tap again.',
    clips: [{ hangul: '물이', roman: 'moo-ree', english: 'water, said again', audioId: 'sound-moo-ree' }],
  },
  {
    id: 'boss',
    title: 'Boss level',
    tip: 'Two taps in a hurry. Lips stay still.',
    clips: [{ hangul: '빨리 빨리', roman: 'ppahl-lee ppahl-lee', english: 'hurry, hurry', audioId: 'sound-ppahl-lee' }],
  },
]

/** ㅂ / ㅍ / ㅃ listen-and-pick. Single syllables reuse the CV chart clips. */
export const BREATH_SETS: ListenSet[] = [
  {
    id: 'bah',
    title: '바 (bah) · 파 (pah) · 빠 (ppah)',
    choices: [
      { hangul: '바', roman: 'bah', english: 'lazy b', audioId: 'syllable-ba' },
      { hangul: '파', roman: 'pah', english: 'blow out a candle', audioId: 'syllable-pa' },
      { hangul: '빠', roman: 'ppah', english: 'p in “spy”', audioId: 'sound-ppah' },
    ],
  },
  {
    id: 'bool',
    title: '불 (bool) · 풀 (pool) · 뿔 (ppool)',
    choices: [
      { hangul: '불', roman: 'bool', english: 'fire', audioId: 'sound-bool' },
      { hangul: '풀', roman: 'pool', english: 'grass', audioId: 'sound-pool' },
      { hangul: '뿔', roman: 'ppool', english: 'horn', audioId: 'sound-ppool' },
    ],
  },
  {
    id: 'bahng',
    title: '방 (bahng) · 팡 (pahng) · 빵 (ppahng)',
    choices: [
      { hangul: '방', roman: 'bahng', english: 'room', audioId: 'batchim-bang' },
      { hangul: '팡', roman: 'pahng', english: 'pop!', audioId: 'sound-pahng' },
      { hangul: '빵', roman: 'ppahng', english: 'bread', audioId: 'sound-ppahng' },
    ],
  },
  {
    id: 'visa',
    title: '비자 (bee-jah) · 피자 (pee-jah)',
    choices: [
      { hangul: '비자', roman: 'bee-jah', english: 'visa', audioId: 'sound-bee-jah' },
      { hangul: '피자', roman: 'pee-jah', english: 'pizza', audioId: 'sound-pee-jah' },
    ],
  },
  {
    id: 'foot',
    title: '발 (bahl) · 팔 (pahl)',
    choices: [
      { hangul: '발', roman: 'bahl', english: 'foot', audioId: 'sound-bahl' },
      { hangul: '팔', roman: 'pahl', english: 'arm', audioId: 'batchim-pal' },
    ],
  },
]

export function ladderClips(): SoundClip[] {
  return RIEUL_LADDER.flatMap((rung) => rung.clips)
}

export function breathClips(): SoundClip[] {
  const seen = new Set<string>()
  const clips: SoundClip[] = []
  for (const set of BREATH_SETS) {
    for (const choice of set.choices) {
      if (seen.has(choice.audioId)) continue
      seen.add(choice.audioId)
      clips.push(choice)
    }
  }
  return clips
}
