import { TranslationConfig, ReciterConfig, TranslationAudioConfig } from './types'

export const ARTIST_NAME = 'Mishari Rashid Alafasy'
export const ALBUM_NAME = 'The Quran'
export const HOMEPAGE_TITLE = 'Tuwa - Web Player'
export const CHAPTER_TITLE_SUFFIX = ' - Tuwa Audio'

export const TRANSLATIONS_CONFIG: Record<string, TranslationConfig> = {
  'en': { name: 'English', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/en.xml' },
  'sq': { name: 'Albanian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/sq.ahmeti.xml' },
  'ber': { name: 'Amazigh', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ber.mensur.xml' },
  'am': { name: 'Amharic', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/am.sadiq.xml' },
  'ar': { name: 'Arabic', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ar.muyassar.xml' },
  'az': { name: 'Azerbaijani', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/az.musayev.xml' },
  'bn': { name: 'Bengali', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/bn.bengali.xml' },
  'bs': { name: 'Bosnian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/bs.korkut.xml' },
  'bg': { name: 'Bulgarian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/bg.theophanov.xml' },
  'zh': { name: 'Chinese', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/zh.jian.xml' },
  'cs': { name: 'Czech', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/cs.hrbek.xml' },
  'dv': { name: 'Divehi', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/dv.divehi.xml' },
  'nl': { name: 'Dutch', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/nl.siregar.xml' },
  'fr': { name: 'French', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/fr.hamidullah.xml' },
  'de': { name: 'German', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/de.bubenheim.xml' },
  'ha': { name: 'Hausa', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ha.gumi.xml' },
  'he': { name: 'Hebrew', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/he.xml' },
  'hi': { name: 'Hindi', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/hi.hindi.xml' },
  'id': { name: 'Indonesian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/id.indonesian.xml' },
  'it': { name: 'Italian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/it.piccardo.xml' },
  'ja': { name: 'Japanese', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ja.japanese.xml' },
  'ko': { name: 'Korean', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ko.korean.xml' },
  'ku': { name: 'Kurdish', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ku.asan.xml' },
  'ms': { name: 'Malay', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ms.basmeih.xml' },
  'ml': { name: 'Malayalam', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ml.abdulhameed.xml' },
  'no': { name: 'Norwegian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/no.berg.xml' },
  'ps': { name: 'Pashto', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ps.abdulwali.xml' },
  'fa': { name: 'Persian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/fa.khorramdel.xml' },
  'pl': { name: 'Polish', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/pl.bielawskiego.xml' },
  'pt': { name: 'Portuguese', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/pt.elhayek.xml' },
  'ro': { name: 'Romanian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ro.grigore.xml' },
  'ru': { name: 'Russian', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ru.kuliev.xml' },
  'sd': { name: 'Sindhi', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/sd.amroti.xml' },
  'so': { name: 'Somali', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/so.abduh.xml' },
  'es': { name: 'Spanish', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/es.garcia.xml' },
  'sw': { name: 'Swahili', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/sw.barwani.xml' },
  'sv': { name: 'Swedish', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/sv.bernstrom.xml' },
  'ta': { name: 'Tamil', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ta.tamil.xml' },
  'tt': { name: 'Tatar', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/tt.nugman.xml' },
  'th': { name: 'Thai', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/th.thai.xml' },
  'tr': { name: 'Turkish', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/tr.diyanet.xml' },
  'ur': { name: 'Urdu', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ur.junagarhi.xml' },
  'ug': { name: 'Uyghur', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/ug.saleh.xml' },
  'uz': { name: 'Uzbek', url: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/uz.sodik.xml' },
}

export const RECITERS_CONFIG: Record<string, ReciterConfig> = {
  'alafasy': { name: 'Mishary Alafasy' },
  'juhaynee': { name: 'Al Juhany' },
  'sudais': { name: 'As Sudais' },
  'ghamadi': { name: 'Al Ghamdi' },
  'abbad': { name: 'Fares Abbad' },
  'muaiqly': { name: 'Al Muaiqly' },
  'shuraym': { name: 'Ash Shuraym' },
  'basit': { name: 'Abdul Basit' },
  'ayyoub': { name: 'Muhammad Ayyoub' },
  'minshawy': { name: 'Minshawy' },
  'jaber': { name: 'Ali Jaber' },
  'ajamy': { name: 'Ahmed Ali Ajamy' },
}

export const TRANSLATION_AUDIO_CONFIG: Record<string, TranslationAudioConfig> = {
  'none': { name: 'No Audio Translation', path: '' },
  'en_walk': { name: 'English', path: 'English/Sahih_Intnl_Ibrahim_Walk_192kbps' },
  'id_ministry': { name: 'Indonesian', path: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/audio/play/id' },
  'es': { name: 'Spanish', path: 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/es.garcia.xml' },
}

export const RTL_CODES = new Set(['ar', 'dv', 'fa', 'he', 'ku', 'ps', 'sd', 'ur', 'ug'])

export const FTT_URL = 'https://raw.githubusercontent.com/Quran-lite-pages-dev/Quran-lite.pages.dev/refs/heads/master/assets/data/translations/FTT.XML'

export const STORAGE_KEY = 'quranState_1'

export const KEYBOARD_KEYS = [
  'A','B','C','D','E','F','G','H','I','J','K','L','M',
  'N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  '1','2','3','4','5','6','7','8','9','0','SPACE', 'DEL', 'CLEAR',
]

export const SUPPORTED_LOCALES = ['en', 'ar', 'es', 'fr', 'he', 'zh']

export const EQ_BANDS = [
  { label: 'Bass', freq: 80, type: 'lowshelf' as const, Q: 0.7 },
  { label: 'Low Mid', freq: 500, type: 'peaking' as const, Q: 1.0 },
  { label: 'High Mid', freq: 2500, type: 'peaking' as const, Q: 1.0 },
  { label: 'Treble', freq: 8000, type: 'highshelf' as const, Q: 0.7 },
]
