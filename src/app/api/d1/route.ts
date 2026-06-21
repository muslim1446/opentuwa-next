export const runtime = 'edge'

import { getRequestContext } from '@cloudflare/next-on-pages'

const API_TOKEN = process.env.CMS_API_TOKEN || 'opentuwa-cms-token'

export async function POST(request: Request) {
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${API_TOKEN}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ctx = getRequestContext()
  const db = ctx.env.DB as D1Database

  let body: { sql: string; params?: unknown[] }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.sql || typeof body.sql !== 'string') {
    return Response.json({ error: 'Missing or invalid sql' }, { status: 400 })
  }

  const sql = body.sql.trim().toUpperCase()
  if (sql.startsWith('INSERT') || sql.startsWith('UPDATE') || sql.startsWith('DELETE') || sql.startsWith('CREATE') || sql.startsWith('DROP') || sql.startsWith('ALTER')) {
    try {
      const result = await db.prepare(body.sql).bind(...(body.params || [])).run()
      return Response.json({ success: true, result })
    } catch (err: any) {
      return Response.json({ error: err.message }, { status: 500 })
    }
  }

  try {
    const result = await db.prepare(body.sql).bind(...(body.params || [])).all()
    return Response.json({ success: true, results: result.results })
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
