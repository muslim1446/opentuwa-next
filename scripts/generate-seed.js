// Run: node scripts/generate-seed.js > seed-alafasy.sql
// Then: wrangler d1 execute opentuwa-prod --file=seed-alafasy.sql

const SURAH_METADATA = [
  { chapter: 1, english_name: 'The Opening', description: 'Revealed in Mecca, this is the fundamental prayer of Islam. (7 verses)' },
  { chapter: 2, english_name: 'The Cow', description: 'The longest Surah, revealed in Medina. It establishes Islamic laws. (286 verses)' },
  { chapter: 3, english_name: 'The Family of Imran', description: 'A Medinan chapter focusing on the Oneness of God. (200 verses)' },
  { chapter: 4, english_name: 'The Women', description: 'Revealed in Medina, addressing the rights of women. (176 verses)' },
  { chapter: 5, english_name: 'The Table Spread', description: 'One of the last revealed Surahs, finalizing dietary laws. (120 verses)' },
  { chapter: 6, english_name: 'The Cattle', description: 'A late Meccan Surah emphasizing pure monotheism. (165 verses)' },
  { chapter: 7, english_name: 'The Heights', description: 'A Meccan chapter detailing the history of prophets. (206 verses)' },
  { chapter: 8, english_name: 'The Spoils of War', description: 'Revealed after the Battle of Badr, clarifying ethics of warfare. (75 verses)' },
  { chapter: 9, english_name: 'The Repentance', description: 'A Medinan text addressing treaty violations. (129 verses)' },
  { chapter: 10, english_name: 'Jonah', description: 'A Meccan Surah emphasizing God\'s Oneness. (109 verses)' },
  { chapter: 11, english_name: 'Hud', description: 'Revealed during a difficult period, recounting stories of previous prophets. (123 verses)' },
  { chapter: 12, english_name: 'Joseph', description: 'A unique Meccan Surah devoted entirely to the story of Joseph. (111 verses)' },
  { chapter: 13, english_name: 'The Thunder', description: 'Revealed in Medina, utilizing natural phenomena like thunder. (43 verses)' },
  { chapter: 14, english_name: 'Abraham', description: 'A Meccan chapter highlighting the prayer of Abraham. (52 verses)' },
  { chapter: 15, english_name: 'The Rocky Tract', description: 'A Meccan Surah reassuring the Prophet against mockery. (99 verses)' },
  { chapter: 16, english_name: 'The Bee', description: 'A Meccan chapter calling attention to God\'s blessings in nature. (128 verses)' },
  { chapter: 17, english_name: 'The Night Journey', description: 'Commemorates the Prophet\'s miraculous night journey. (111 verses)' },
  { chapter: 18, english_name: 'The Cave', description: 'A Meccan Surah telling the story of the Sleepers of the Cave. (110 verses)' },
  { chapter: 19, english_name: 'Mary', description: 'A Meccan chapter detailing the miraculous births of Jesus and John. (98 verses)' },
  { chapter: 20, english_name: 'Ta-Ha', description: 'Revealed in Mecca, detailing the story of Moses confronting Pharaoh. (135 verses)' },
  { chapter: 21, english_name: 'The Prophets', description: 'A Meccan text referencing many prophets. (112 verses)' },
  { chapter: 22, english_name: 'The Pilgrimage', description: 'A Medinan Surah establishing the rituals of the Hajj pilgrimage. (78 verses)' },
  { chapter: 23, english_name: 'The Believers', description: 'Revealed in Mecca, outlining the moral qualities of true believers. (118 verses)' },
  { chapter: 24, english_name: 'The Light', description: 'A Medinan chapter focusing on social ethics. (64 verses)' },
  { chapter: 25, english_name: 'The Criterion', description: 'A Meccan Surah distinguishing right from wrong. (77 verses)' },
  { chapter: 26, english_name: 'The Poets', description: 'A Meccan chapter recounting the struggles of past prophets. (227 verses)' },
  { chapter: 27, english_name: 'The Ant', description: 'Revealed in Mecca, featuring the story of Solomon. (93 verses)' },
  { chapter: 28, english_name: 'The Narratives', description: 'A Meccan Surah detailing the life of Moses before prophethood. (88 verses)' },
  { chapter: 29, english_name: 'The Spider', description: 'A Meccan chapter using the metaphor of a spider\'s web. (69 verses)' },
  { chapter: 30, english_name: 'The Romans', description: 'Revealed in Mecca, predicting the Byzantine victory over the Persians. (60 verses)' },
  { chapter: 31, english_name: 'Luqman', description: 'A Meccan Surah containing the wisdom of the sage Luqman. (34 verses)' },
  { chapter: 32, english_name: 'The Prostration', description: 'A Meccan chapter emphasizing the creation of man. (30 verses)' },
  { chapter: 33, english_name: 'The Combined Forces', description: 'Revealed in Medina during the Battle of the Trench. (73 verses)' },
  { chapter: 34, english_name: 'Sheba', description: 'A Meccan Surah contrasting gratitude with ingratitude. (54 verses)' },
  { chapter: 35, english_name: 'The Originator', description: 'A Meccan chapter praising God as the Creator. (45 verses)' },
  { chapter: 36, english_name: 'O Man', description: 'Known as the heart of the Quran. (83 verses)' },
  { chapter: 37, english_name: 'Those Who Set The Ranks', description: 'A Meccan chapter describing the ranks of angels. (182 verses)' },
  { chapter: 38, english_name: 'The Letter Sad', description: 'Revealed in Mecca, discussing the patience of prophets. (88 verses)' },
  { chapter: 39, english_name: 'The Troops', description: 'A Meccan Surah focusing on the Oneness of God. (75 verses)' },
  { chapter: 40, english_name: 'The Forgiver', description: 'A Meccan chapter telling the story of a believing man. (85 verses)' },
  { chapter: 41, english_name: 'Explained in Detail', description: 'A Meccan Surah describing the Quran\'s clarity. (54 verses)' },
  { chapter: 42, english_name: 'The Consultation', description: 'A Meccan chapter emphasizing Shura among believers. (53 verses)' },
  { chapter: 43, english_name: 'The Ornaments of Gold', description: 'A Meccan Surah criticizing obsession with worldly wealth. (89 verses)' },
  { chapter: 44, english_name: 'The Smoke', description: 'A Meccan chapter warning of a coming punishment. (59 verses)' },
  { chapter: 45, english_name: 'The Crouching', description: 'A Meccan Surah describing the humility of all nations. (37 verses)' },
  { chapter: 46, english_name: 'The Wind-Curved Sandhills', description: 'A Meccan chapter mentioning the Jinn listening to the Quran. (35 verses)' },
  { chapter: 47, english_name: 'Muhammad', description: 'A Medinan Surah focused on the believers\' struggle. (38 verses)' },
  { chapter: 48, english_name: 'The Victory', description: 'Revealed after the Treaty of Hudaybiyyah. (29 verses)' },
  { chapter: 49, english_name: 'The Rooms', description: 'A Medinan chapter teaching manners and brotherhood. (18 verses)' },
  { chapter: 50, english_name: 'The Letter Qaf', description: 'A Meccan Surah emphasizing the resurrection. (45 verses)' },
  { chapter: 51, english_name: 'The Winnowing Winds', description: 'A Meccan chapter discussing the purpose of creation. (60 verses)' },
  { chapter: 52, english_name: 'The Mount', description: 'A Meccan Surah swearing by Mount Sinai. (49 verses)' },
  { chapter: 53, english_name: 'The Star', description: 'A Meccan chapter confirming the divine source of revelation. (62 verses)' },
  { chapter: 54, english_name: 'The Moon', description: 'A Meccan Surah referencing the splitting of the moon. (55 verses)' },
  { chapter: 55, english_name: 'The Beneficent', description: 'Known as the Bride of the Quran. (78 verses)' },
  { chapter: 56, english_name: 'The Inevitable', description: 'A Meccan Surah categorizing people into three groups. (96 verses)' },
  { chapter: 57, english_name: 'The Iron', description: 'A Medinan chapter encouraging charity. (29 verses)' },
  { chapter: 58, english_name: 'The Pleading Woman', description: 'A Medinan Surah addressing marital issues. (22 verses)' },
  { chapter: 59, english_name: 'The Exile', description: 'Revealed in Medina concerning the Banu Nadir. (24 verses)' },
  { chapter: 60, english_name: 'She That Is To Be Examined', description: 'A Medinan chapter regarding treatment of women refugees. (13 verses)' },
  { chapter: 61, english_name: 'The Ranks', description: 'A Medinan Surah urging believers to align actions with words. (14 verses)' },
  { chapter: 62, english_name: 'The Congregation', description: 'A Medinan chapter establishing the Friday prayer. (11 verses)' },
  { chapter: 63, english_name: 'The Hypocrites', description: 'A Medinan Surah exposing the deceit of hypocrites. (11 verses)' },
  { chapter: 64, english_name: 'The Mutual Disillusion', description: 'A Medinan chapter describing Judgment Day. (18 verses)' },
  { chapter: 65, english_name: 'The Divorce', description: 'A Medinan Surah outlining divorce laws. (12 verses)' },
  { chapter: 66, english_name: 'The Prohibition', description: 'A Medinan chapter addressing a domestic incident. (12 verses)' },
  { chapter: 67, english_name: 'The Sovereignty', description: 'A Meccan Surah affirming God\'s dominion. (30 verses)' },
  { chapter: 68, english_name: 'The Pen', description: 'A Meccan chapter defending the Prophet\'s character. (52 verses)' },
  { chapter: 69, english_name: 'The Reality', description: 'A Meccan Surah describing the Day of Judgment. (52 verses)' },
  { chapter: 70, english_name: 'The Ascending Stairways', description: 'A Meccan chapter focusing on patience. (44 verses)' },
  { chapter: 71, english_name: 'Noah', description: 'A Meccan Surah dedicated to Noah\'s preaching. (28 verses)' },
  { chapter: 72, english_name: 'The Jinn', description: 'A Meccan chapter recounting the Jinn who accepted Islam. (28 verses)' },
  { chapter: 73, english_name: 'The Enshrouded One', description: 'A Meccan Surah instructing the Prophet to pray at night. (20 verses)' },
  { chapter: 74, english_name: 'The Cloaked One', description: 'One of the earliest Meccan revelations. (56 verses)' },
  { chapter: 75, english_name: 'The Resurrection', description: 'A Meccan chapter emphasizing the certainty of the resurrection. (40 verses)' },
  { chapter: 76, english_name: 'Man', description: 'A Medinan Surah describing the rewards of the righteous. (31 verses)' },
  { chapter: 77, english_name: 'The Emissaries', description: 'A Meccan chapter swearing by the winds. (50 verses)' },
  { chapter: 78, english_name: 'The Tidings', description: 'A Meccan Surah questioning those who deny the afterlife. (40 verses)' },
  { chapter: 79, english_name: 'Those Who Drag Forth', description: 'A Meccan chapter describing the angels who take souls. (46 verses)' },
  { chapter: 80, english_name: 'He Frowned', description: 'A Meccan Surah correcting the Prophet. (42 verses)' },
  { chapter: 81, english_name: 'The Overthrowing', description: 'A Meccan chapter depicting cosmic upheavals. (29 verses)' },
  { chapter: 82, english_name: 'The Cleaving', description: 'A Meccan Surah warning humanity about their delusion. (19 verses)' },
  { chapter: 83, english_name: 'The Defrauding', description: 'A Meccan chapter condemning cheating in business. (36 verses)' },
  { chapter: 84, english_name: 'The Sundering', description: 'A Meccan Surah describing the sky splitting open. (25 verses)' },
  { chapter: 85, english_name: 'The Mansions of the Stars', description: 'A Meccan chapter recounting the People of the Ditch. (22 verses)' },
  { chapter: 86, english_name: 'The Morning Star', description: 'A Meccan Surah discussing the creation of man. (17 verses)' },
  { chapter: 87, english_name: 'The Most High', description: 'A Meccan chapter emphasizing purification of the soul. (19 verses)' },
  { chapter: 88, english_name: 'The Overwhelming', description: 'A Meccan Surah contrasting the damned with the blessed. (26 verses)' },
  { chapter: 89, english_name: 'The Dawn', description: 'A Meccan chapter warning against greed for wealth. (30 verses)' },
  { chapter: 90, english_name: 'The City', description: 'A Meccan Surah defining the steep path of righteousness. (20 verses)' },
  { chapter: 91, english_name: 'The Sun', description: 'A Meccan chapter linking purification to success. (15 verses)' },
  { chapter: 92, english_name: 'The Night', description: 'A Meccan Surah contrasting charity with miserliness. (21 verses)' },
  { chapter: 93, english_name: 'The Morning Hours', description: 'Revealed to comfort the Prophet after a pause in revelation. (11 verses)' },
  { chapter: 94, english_name: 'The Relief', description: 'A Meccan chapter reassuring with every hardship comes ease. (8 verses)' },
  { chapter: 95, english_name: 'The Fig', description: 'A Meccan Surah stating man was created in the best stature. (8 verses)' },
  { chapter: 96, english_name: 'The Clot', description: 'The first revelation received by the Prophet. (19 verses)' },
  { chapter: 97, english_name: 'The Power', description: 'A Meccan chapter describing the Night of Decree. (5 verses)' },
  { chapter: 98, english_name: 'The Clear Proof', description: 'A Medinan Surah distinguishing true believers. (8 verses)' },
  { chapter: 99, english_name: 'The Earthquake', description: 'A Medinan chapter describing the earth shaking. (8 verses)' },
  { chapter: 100, english_name: 'The Courser', description: 'A Meccan Surah using the imagery of charging warhorses. (11 verses)' },
  { chapter: 101, english_name: 'The Calamity', description: 'A Meccan chapter depicting the Day of Judgment. (11 verses)' },
  { chapter: 102, english_name: 'The Rivalry in World Increase', description: 'A Meccan Surah warning against obsession with wealth. (8 verses)' },
  { chapter: 103, english_name: 'The Declining Day', description: 'A Meccan chapter summarizing that mankind is in loss. (3 verses)' },
  { chapter: 104, english_name: 'The Traducer', description: 'A Meccan Surah condemning the backbiter. (9 verses)' },
  { chapter: 105, english_name: 'The Elephant', description: 'A Meccan chapter recalling the destruction of Abraha\'s army. (5 verses)' },
  { chapter: 106, english_name: 'Quraysh', description: 'A Meccan Surah reminding the Quraysh tribe of God\'s protection. (4 verses)' },
  { chapter: 107, english_name: 'The Small Kindnesses', description: 'A Meccan chapter condemning those who deny the judgment. (7 verses)' },
  { chapter: 108, english_name: 'The Abundance', description: 'The shortest Surah, promising abundance of good. (3 verses)' },
  { chapter: 109, english_name: 'The Disbelievers', description: 'A Meccan Surah declaring distinction between worship. (6 verses)' },
  { chapter: 110, english_name: 'The Divine Support', description: 'A Medinan chapter predicting the mass entry into Islam. (3 verses)' },
  { chapter: 111, english_name: 'The Palm Fiber', description: 'A Meccan Surah condemning Abu Lahab. (5 verses)' },
  { chapter: 112, english_name: 'The Sincerity', description: 'A Meccan chapter that is the essence of monotheism. (4 verses)' },
  { chapter: 113, english_name: 'The Daybreak', description: 'A Meccan Surah seeking refuge in the Lord of the dawn. (5 verses)' },
  { chapter: 114, english_name: 'Mankind', description: 'A Meccan chapter seeking refuge from the whispers of devils. (6 verses)' },
];

function encodeAlbumId(chapter) {
  return String(chapter).padStart(3, '0') + '00000000';
}

function encodeSongId(chapter, verse) {
  return String(chapter).padStart(3, '0') + String(verse).padStart(3, '0') + '00000';
}

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseVerseCount(desc) {
  const m = desc.match(/\((\d+) verses?\)/);
  return m ? parseInt(m[1]) : 0;
}

const AUDIO_BASE = 'https://hosting.opentuwa.com';
const TIMING_BASE = 'https://raw.githubusercontent.com/muslim1446/CDN-muslim.opentuwa.com/main';

console.log('-- OpenTuwa Seed Data: Mishari Rashid Alafasy');
console.log('-- Generated by scripts/generate-seed.js');
console.log('-- Run: wrangler d1 execute opentuwa-prod --file=seed-alafasy.sql');
console.log('');

console.log(`INSERT OR REPLACE INTO artists (id, name, slug, bio, artwork_url, genre, created_at, updated_at) VALUES (
  'alafasy',
  'Mishari Rashid Alafasy',
  'mishary-rashid-alafasy',
  'Kuwaiti qari and imam. One of the most renowned Quran reciters in the Muslim world, known for his soulful and emotional recitations.',
  'https://opentuwa.com/assets/ui/web_1200.png',
  'Quran, Recitation',
  datetime('now'),
  datetime('now')
);`);
console.log('');

let totalTracks = 0;
for (const surah of SURAH_METADATA) {
  const albumId = encodeAlbumId(surah.chapter);
  const vc = parseVerseCount(surah.description);
  const slug = slugify(surah.english_name);
  const paddedCh = String(surah.chapter).padStart(3, '0');
  totalTracks += vc;

  console.log(`-- ${surah.chapter}. ${surah.english_name} (${vc} verses)`);
  console.log(`INSERT OR REPLACE INTO albums (id, artist_id, title, slug, description, artwork_url, genre, track_count, is_verse_based, has_timing, timing_base_url, audio_base_url, created_at, updated_at) VALUES (
  '${albumId}',
  'alafasy',
  '${surah.english_name.replace(/'/g, "''")}',
  '${slug}',
  '${surah.description.replace(/'/g, "''")}',
  'https://opentuwa.com/assets/ui/web_1200.png',
  'Quran, Recitation',
  ${vc},
  1,
  1,
  '${TIMING_BASE}',
  '${AUDIO_BASE}',
  datetime('now'),
  datetime('now')
);`);

  for (let v = 1; v <= vc; v++) {
    const trackId = encodeSongId(surah.chapter, v);
    console.log(`INSERT OR REPLACE INTO tracks (id, album_id, artist_id, title, slug, track_number, disc_number, duration_ms, audio_url, timing_json_url, has_timing, created_at, updated_at) VALUES (
  '${trackId}',
  '${albumId}',
  'alafasy',
  '${surah.english_name.replace(/'/g, "''")} — Verse ${v}',
  'verse-${v}',
  ${v},
  1,
  8000,
  '${AUDIO_BASE}/${paddedCh}.wav',
  '${TIMING_BASE}/${paddedCh}.json',
  1,
  datetime('now'),
  datetime('now')
);`);
  }
}

console.log('');
console.log('-- Seed complete.');
console.log(`-- 1 artist, ${SURAH_METADATA.length} albums, ${totalTracks} tracks`);
