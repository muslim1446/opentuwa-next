import { redirect } from 'next/navigation'
import { SURAH_METADATA } from '@/lib/surah-metadata'
import { slugify } from '@/lib/artwork'

export default async function ChapterRedirectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ch = SURAH_METADATA.find(s => s.chapter === parseInt(id))
  if (!ch) redirect('/en')

  const slug = slugify(ch.english_name)
  redirect(`/en/surah/${slug}/${id}`)
}
