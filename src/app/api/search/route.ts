import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface AiTextGenerationOutput {
  response: string
}

const SURAH_NAMES: { name: string; num: number }[] = [
  { name: 'The Opening', num: 1 }, { name: 'The Cow', num: 2 }, { name: 'Family of Imran', num: 3 },
  { name: 'The Women', num: 4 }, { name: 'The Table Spread', num: 5 }, { name: 'The Cattle', num: 6 },
  { name: 'The Heights', num: 7 }, { name: 'The Spoils of War', num: 8 }, { name: 'The Repentance', num: 9 },
  { name: 'Jonah', num: 10 }, { name: 'Hud', num: 11 }, { name: 'Joseph', num: 12 },
  { name: 'The Thunder', num: 13 }, { name: 'Abraham', num: 14 }, { name: 'The Rocky Tract', num: 15 },
  { name: 'The Bee', num: 16 }, { name: 'The Night Journey', num: 17 }, { name: 'The Cave', num: 18 },
  { name: 'Mary', num: 19 }, { name: 'Ta Ha', num: 20 }, { name: 'The Prophets', num: 21 },
  { name: 'The Pilgrimage', num: 22 }, { name: 'The Believers', num: 23 }, { name: 'The Light', num: 24 },
  { name: 'The Criterion', num: 25 }, { name: 'The Poets', num: 26 }, { name: 'The Ant', num: 27 },
  { name: 'The Stories', num: 28 }, { name: 'The Spider', num: 29 }, { name: 'The Romans', num: 30 },
  { name: 'Luqman', num: 31 }, { name: 'The Prostration', num: 32 }, { name: 'The Combined Forces', num: 33 },
  { name: 'Saba', num: 34 }, { name: 'The Originator', num: 35 }, { name: 'Ya Sin', num: 36 },
  { name: 'The Ranks', num: 37 }, { name: 'Sad', num: 38 }, { name: 'The Groups', num: 39 },
  { name: 'The Forgiver', num: 40 }, { name: 'Explained in Detail', num: 41 }, { name: 'The Consultation', num: 42 },
  { name: 'Ornaments of Gold', num: 43 }, { name: 'The Smoke', num: 44 }, { name: 'The Kneeling', num: 45 },
  { name: 'The Sand Dunes', num: 46 }, { name: 'Muhammad', num: 47 }, { name: 'The Victory', num: 48 },
  { name: 'The Inner Apartments', num: 49 }, { name: 'Qaf', num: 50 }, { name: 'The Winnowing Winds', num: 51 },
  { name: 'The Mount', num: 52 }, { name: 'The Star', num: 53 }, { name: 'The Moon', num: 54 },
  { name: 'The Most Gracious', num: 55 }, { name: 'The Inevitable', num: 56 }, { name: 'The Iron', num: 57 },
  { name: 'The Pleading Woman', num: 58 }, { name: 'The Gathering', num: 59 }, { name: 'The Examined One', num: 60 },
  { name: 'The Ranks', num: 61 }, { name: 'The Congregation', num: 62 }, { name: 'The Hypocrites', num: 63 },
  { name: 'Mutual Disillusion', num: 64 }, { name: 'The Divorce', num: 65 }, { name: 'The Prohibition', num: 66 },
  { name: 'The Dominion', num: 67 }, { name: 'The Pen', num: 68 }, { name: 'The Inevitable Hour', num: 69 },
  { name: 'The Ascending Stairways', num: 70 }, { name: 'Noah', num: 71 }, { name: 'The Jinn', num: 72 },
  { name: 'The Enwrapped One', num: 73 }, { name: 'The Cloaked One', num: 74 }, { name: 'The Resurrection', num: 75 },
  { name: 'Man', num: 76 }, { name: 'The Sent Forth', num: 77 }, { name: 'The News', num: 78 },
  { name: 'Those Who Tear Out', num: 79 }, { name: 'He Frowned', num: 80 }, { name: 'The Overthrowing', num: 81 },
  { name: 'The Cleaving', num: 82 }, { name: 'The Defrauding', num: 83 }, { name: 'The Splitting Open', num: 84 },
  { name: 'The Mansions of the Stars', num: 85 }, { name: 'The Nightcomer', num: 86 }, { name: 'The Most High', num: 87 },
  { name: 'The Overwhelming', num: 88 }, { name: 'The Dawn', num: 89 }, { name: 'The City', num: 90 },
  { name: 'The Sun', num: 91 }, { name: 'The Night', num: 92 }, { name: 'The Morning Brightness', num: 93 },
  { name: 'The Relief', num: 94 }, { name: 'The Fig', num: 95 }, { name: 'The Clot', num: 96 },
  { name: 'The Night of Decree', num: 97 }, { name: 'The Clear Proof', num: 98 }, { name: 'The Earthquake', num: 99 },
  { name: 'The Runners', num: 100 }, { name: 'The Striking Calamity', num: 101 }, { name: 'The Mutual Rivalry', num: 102 },
  { name: 'The Declining Day', num: 103 }, { name: 'The Slanderer', num: 104 }, { name: 'The Elephant', num: 105 },
  { name: 'Quraysh', num: 106 }, { name: 'The Small Kindnesses', num: 107 }, { name: 'The Abundance', num: 108 },
  { name: 'The Disbelievers', num: 109 }, { name: 'The Divine Support', num: 110 }, { name: 'The Palm Fiber', num: 111 },
  { name: 'The Sincerity', num: 112 }, { name: 'The Daybreak', num: 113 }, { name: 'The Mankind', num: 114 },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const query = body.query
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const isNumeric = !isNaN(query) && Number(query) >= 1 && Number(query) <= 114
    let chapters: number[] = []

    if (isNumeric) {
      chapters = [parseInt(query)]
    } else {
      const searchTerms = query.toLowerCase().split(' ')
      const scores: { num: number; score: number }[] = SURAH_NAMES.map(s => {
        const nameLower = s.name.toLowerCase()
        let score = 0
        for (const term of searchTerms) {
          if (nameLower === term) score += 10
          else if (nameLower.startsWith(term)) score += 5
          else if (nameLower.includes(term)) score += 2
        }
        return { num: s.num, score }
      })
      chapters = scores
        .filter(s => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(s => s.num)
    }

    chapters = chapters.filter(n => !isNaN(n) && n >= 1 && n <= 114)
    return NextResponse.json({ chapters })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
