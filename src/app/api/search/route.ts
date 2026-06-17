import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

interface AiTextGenerationOutput {
  response: string
}

interface CloudflareEnv {
  AI?: {
    run: (model: string, options: { messages: Array<{ role: string; content: string }> }) => Promise<AiTextGenerationOutput>
  }
}

declare const process: {
  env: CloudflareEnv & Record<string, string | undefined>
}

function isCloudflarePages(): boolean {
  return typeof (globalThis as any).caches !== 'undefined' && typeof (process as any).env?.AI !== 'undefined'
}

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
    } else if (isCloudflarePages() && (process.env as any).AI) {
      const systemPrompt = `
        You are a Quran search engine.
        Task: Return a JSON Array of chapter numbers (1-114) that match the user's topic.
        - If specific (e.g., "Joseph"), return one: [12]
        - If broad (e.g., "Prophets"), return all relevant: [21, 12, 11, 10, ...]
        - Order by relevance.
        - STRICTLY return ONLY the JSON array. No text.
      `
      const ai = (process.env as any).AI as NonNullable<CloudflareEnv['AI']>
      const response = await ai.run('@cf/google/gemma-3-12b-it', {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
      })

      let raw = response.response.trim()
      raw = raw.replace(/```json/g, '').replace(/```/g, '').trim()

      try {
        chapters = JSON.parse(raw)
        if (!Array.isArray(chapters)) chapters = [parseInt(raw)]
      } catch {
        const match = raw.match(/\d+/g)
        if (match) chapters = match.map(n => parseInt(n))
      }
    } else {
      // Fallback: simple keyword-based search for local/dev
      const searchTerms = query.toLowerCase().split(' ')
      chapters = [
        { name: 'The Opening', num: 1 },
        { name: 'Joseph', num: 12 },
        { name: 'Mary', num: 19 },
        { name: 'The Prophets', num: 21 },
        { name: 'Noah', num: 71 },
        { name: 'The Cave', num: 18 },
        { name: 'The Moon', num: 54 },
        { name: 'The Beneficent', num: 55 },
        { name: 'The Sovereignty', num: 67 },
        { name: 'The Sincerity', num: 112 },
      ]
        .filter(s => searchTerms.some((t: string) => s.name.toLowerCase().includes(t)))
        .map(s => s.num)
    }

    chapters = chapters
      .map(n => parseInt(String(n)))
      .filter(n => !isNaN(n) && n >= 1 && n <= 114)

    return NextResponse.json({ chapters })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
