import { TimingData } from './types'

const timingCache: Record<number, TimingData> = {}

export async function getChapterTiming(chapterNum: number): Promise<TimingData | null> {
  if (timingCache[chapterNum]) return timingCache[chapterNum]

  const padCh = String(chapterNum).padStart(3, '0')
  const url = `https://raw.githubusercontent.com/muslim1446/CDN-muslim.opentuwa.com/main/${padCh}.json`

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const data: TimingData = await res.json()
    timingCache[chapterNum] = data
    return data
  } catch (e) {
    console.error('Failed to load timing JSON for chapter:', chapterNum, e)
    return null
  }
}
