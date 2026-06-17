export interface SurahMeta {
  chapter: number
  english_name: string
  description: string
}

export interface VerseData {
  verseNumber: number
  verse: number
}

export interface ChapterData {
  chapterNumber: number
  title: string
  english_name: string
  description: string
  verses: VerseData[]
}

export interface QuranApiResponse {
  chapters: ChapterData[]
}

export interface TimingVerse {
  verse: number
  start_time_ms: number
  end_time_ms: number
}

export interface TimingData {
  verses: TimingVerse[]
}

export interface TranslationConfig {
  name: string
  url: string
}

export interface ReciterConfig {
  name: string
}

export interface TranslationAudioConfig {
  name: string
  path: string
}

export interface StreamData {
  chapter: number
  verse: number
  reciter: string
  trans: string
  audio_trans: string
}

export interface PlayerState {
  chapter: number
  verse: number
  reciter: string
  trans: string
  audio_trans: string
}

export interface SearchResult {
  chapters: number[]
}

export type ViewType = 'dashboard' | 'cinema'
