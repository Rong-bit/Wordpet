// Generates src/data/wordbanks/*.json from:
//  - 大考中心《高中英文參考詞彙表》(111 學年度起適用) — headwords, POS, level 1–6
//    (著作權屬財團法人大學入學考試中心基金會，僅供非營利使用，轉載請註明出處)
//  - 教育部 108 課綱國中小參考字彙表 2000 字 — headwords
//  - ECDICT (MIT, https://github.com/skywind3000/ECDICT) — Chinese glosses, phonetics, TOEFL / Oxford 3000 tags
//  - NGSL Project TOEIC Service List 1.2 / Business Service List 1.2 (Browne & Culligan, CC BY-SA 4.0,
//    https://www.newgeneralservicelist.com) — headwords and frequency ranks
// All Chinese text is converted to Taiwan Traditional Chinese (OpenCC cn → twp) and verified before writing.
// Usage: node scripts/build-wordbanks.mjs
import fs from 'node:fs';
import path from 'node:path';
import * as OpenCC from 'opencc-js';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const CACHE = path.join(ROOT, '.wordbank-cache');
const OUT = path.join(ROOT, 'src', 'data', 'wordbanks');
const ECDICT_URL = 'https://raw.githubusercontent.com/skywind3000/ECDICT/master/ecdict.csv';

fs.mkdirSync(CACHE, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const toTW = OpenCC.Converter({ from: 'cn', to: 'twp' });
const cnToTwChars = OpenCC.Converter({ from: 'cn', to: 'tw' });

// Common Simplified-only characters; any hit in the output fails the build.
const SIMPLIFIED_BLOCKLIST = '们这说时会为发经过还动个国学习东车门问开关见长张书读写听语话词亿边应该么来对没实现机电钱区达热众让认识产业务员价单级场岁归弃农';

// Valid in Taiwan Traditional text even though cn→tw rewrites them in some contexts (托福, 傢伙, 岩石, 紀念…).
const TRADITIONAL_OK = new Set([...'只台著於占游周干后里面系征采松准制志冲谷余丑卜几托伙表念岩划欲熏']);

function findSimplified(text) {
  const hits = [...text].filter(ch => SIMPLIFIED_BLOCKLIST.includes(ch));
  // Re-running a cn→tw conversion on Taiwan text should be a no-op; any change means leftovers.
  const converted = [...cnToTwChars(text)];
  [...text].forEach((ch, i) => {
    if (converted[i] !== ch && !TRADITIONAL_OK.has(ch) && !hits.includes(ch)) hits.push(ch);
  });
  return hits;
}

async function loadEcdict() {
  const file = path.join(CACHE, 'ecdict.csv');
  if (!fs.existsSync(file)) {
    console.log('Downloading ECDICT…');
    const res = await fetch(ECDICT_URL);
    if (!res.ok) throw new Error(`ECDICT download failed: ${res.status}`);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
  const text = fs.readFileSync(file, 'utf8');
  const rows = parseCsv(text);
  const header = rows.shift();
  const idx = Object.fromEntries(header.map((h, i) => [h, i]));
  const map = new Map();
  for (const r of rows) {
    const word = r[idx.word];
    if (!word) continue;
    const key = word.toLowerCase();
    const entry = {
      word,
      phonetic: r[idx.phonetic] || '',
      translation: r[idx.translation] || '',
      collins: Number(r[idx.collins] || 0),
      oxford: r[idx.oxford] === '1',
      tag: (r[idx.tag] || '').split(/\s+/).filter(Boolean),
      frq: Number(r[idx.frq] || 0),
      bnc: Number(r[idx.bnc] || 0),
    };
    // Prefer the lowercase headword over capitalised proper-noun variants.
    const prev = map.get(key);
    if (!prev || (prev.word !== key && word === key)) map.set(key, entry);
  }
  return map;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const POS_ALIASES = {
  'a.': 'adj.', 'adj.': 'adj.', 's.': 'adj.',
  'ad.': 'adv.', 'adv.': 'adv.',
  'n.': 'n.', 'v.': 'v.', 'vt.': 'v.', 'vi.': 'v.',
  'prep.': 'prep.', 'conj.': 'conj.', 'pron.': 'pron.', 'art.': 'art.',
  'num.': 'num.', 'int.': 'int.', 'interj.': 'int.', 'aux.': 'aux.',
  'abbr.': 'abbr.', 'pl.': 'n.',
};

// ECDICT translation: "n. 能力, 才能\na. ..." -> [{pos, glosses[]}]
function parseTranslation(raw, includeDomainLines = false) {
  const groups = [];
  for (let line of raw.split(/\\n|\n/)) {
    line = line.trim();
    if (!line || (!includeDomainLines && line.startsWith('['))) continue;
    const m = line.match(/^([a-z]+\.)\s*(.*)$/);
    let pos = '';
    let body = line;
    if (m && POS_ALIASES[m[1]]) { pos = POS_ALIASES[m[1]]; body = m[2]; }
    body = body
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\([^)]*\)|（[^）]*）/g, '')
      .replace(/<[^>]*>/g, '');
    const glosses = body
      .split(/[,，;；]/)
      .map(s => s.trim())
      .filter(s => s && /[\u4e00-\u9fff]/.test(s) && s.length <= 10);
    if (glosses.length) groups.push({ pos, glosses });
  }
  if (!groups.length && !includeDomainLines) return parseTranslation(raw, true);
  return groups;
}

// Glosses converted without surrounding context can keep a merged Simplified form; fix the known ones.
const TW_GLOSS_FIXES = {
  松的: '鬆的', 松開: '鬆開', 放松: '放鬆', 寬松的: '寬鬆的', 周: '週', 每周: '每週', 周末: '週末',
  一次所制之量: '一次所製之量', 千米: '公里', 干的: '乾的', 干燥: '乾燥', 干燥的: '乾燥的', 丑陋的: '醜陋的',
};
// Standalone characters whose correct Traditional form depends on the English headword.
const WORD_GLOSS_FIXES = {
  tie: { 系: '繫' }, fasten: { 系: '繫' }, loose: { 松: '鬆' }, loosen: { 松: '鬆' },
  dry: { 干: '乾' }, ugly: { 丑: '醜' }, grain: { 谷: '穀' }, cereal: { 谷: '穀' },
};
let currentHeadword = '';
const twGloss = s => {
  const tw = toTW(s);
  const byWord = WORD_GLOSS_FIXES[currentHeadword.toLowerCase()]?.[tw];
  return byWord ?? TW_GLOSS_FIXES[tw] ?? tw.replace(/(木|鐵|鋼|金|銀|銅|象牙|手工|自|皮|石|紙|竹)制(的|品)/g, '$1製$2');
};
const ambiguousShortGlosses = new Set();

function buildMeaning(ec, wantedPos) {
  if (!ec) return '';
  currentHeadword = ec.word;
  const groups = parseTranslation(ec.translation);
  if (!groups.length) return '';
  const picked = [];
  const order = wantedPos.length ? wantedPos : [groups[0].pos];
  for (const pos of order) {
    const g = groups.find(x => x.pos === pos && !picked.includes(x));
    if (g) picked.push(g);
    if (picked.length >= 2) break;
  }
  if (!picked.length) picked.push(groups[0]);
  const seen = new Set();
  const parts = [];
  picked.forEach((g, gi) => {
    const max = 2;
    for (const s of g.glosses) {
      const tw = twGloss(s);
      if (tw.length <= 2 && /[只台於占游周干后里面系征采松准制志冲谷余丑卜几表念岩划欲熏伙托]/.test(tw)) {
        ambiguousShortGlosses.add(`${ec.word}\t${tw}`);
      }
      if (seen.has(tw)) continue;
      seen.add(tw);
      parts.push(tw);
      if (parts.filter(Boolean).length >= (gi + 1) * max) break;
    }
  });
  return parts.slice(0, 3).join('；');
}

function normalizePosList(raw) {
  return raw
    .replace(/[()]/g, '')
    .split('/')
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => POS_ALIASES[p] || p);
}

function phonetic(ec) {
  return ec && ec.phonetic ? `/${ec.phonetic}/` : '';
}

// --- CEEC 高中 6000 ---------------------------------------------------------
function parseCeec() {
  const lines = fs.readFileSync(path.join(ROOT, 'scripts', 'sources', 'ceec-108-wordlist.txt'), 'utf8').split(/\r?\n/);
  const levelNames = ['第一級', '第二級', '第三級', '第四級', '第五級', '第六級'];
  const entries = [];
  let level = 0;
  const entryRe = /^([A-Za-z][A-Za-z'().\- ]*(?:\/[A-Za-z'().\- ]+)*?)\s+((?:\(?(?:n|v|adj|adv|prep|conj|pron|art|aux|num|int)\.\)?\/?)+)\s*$/;
  for (let raw of lines) {
    let line = raw.replace(/^#+\s*/, '').trim();
    if (level && line.startsWith('依字母排序')) break;
    const lv = levelNames.findIndex(n => line.includes(n));
    if (lv >= 0) {
      level = lv + 1;
      line = line.slice(line.indexOf(levelNames[lv]) + levelNames[lv].length).trim();
      if (!line) continue;
    }
    if (!level) continue;
    const m = line.match(entryRe);
    if (!m) continue;
    const head = m[1].trim();
    const word = head.split('/')[0].replace(/\([^)]*\)/g, '').trim();
    if (!word || word.length < 1) continue;
    entries.push({ word, display: head, pos: normalizePosList(m[2]), level });
  }
  return entries;
}

// --- 國中 2000 ---------------------------------------------------------------
const ZH_POS = {
  名詞: 'n.', 動詞: 'v.', 形容詞: 'adj.', 副詞: 'adv.', 介系詞: 'prep.', 介詞: 'prep.',
  連接詞: 'conj.', 連詞: 'conj.', 代名詞: 'pron.', 冠詞: 'art.', 助動詞: 'aux.',
  感嘆詞: 'int.', 數詞: 'num.', 片語: 'phr.',
};

function parseJunior() {
  const list = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'sources', 'junior-2000-headwords.json'), 'utf8'));
  return list.map(x => ({
    word: String(x.word).trim(),
    pos: String(x.part_of_speech || '')
      .split(/[、,，/／]/)
      .map(s => ZH_POS[s.trim()])
      .filter(Boolean),
  }));
}

function slug(word) {
  return word.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Within a level, common words come first so new-word sessions start with high-frequency vocabulary.
function sortByLevelThenFrequency(rows) {
  const rank = r => {
    const ec = ecdict.get(r[0].toLowerCase());
    return (ec && (ec.frq || ec.bnc)) || 999999;
  };
  return rows
    .map(r => ({ r, k: rank(r) }))
    .sort((a, b) => a.r[3] - b.r[3] || a.k - b.k)
    .map(x => x.r);
}

const simplifiedHits = [];

function writeBank(name, rows) {
  const seen = new Set();
  const unique = rows.filter(r => {
    const k = slug(r[0]);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  for (const r of unique) {
    const hits = findSimplified(r[2]);
    if (hits.length) simplifiedHits.push(`${name}\t${r[0]}\t${r[2]}\t[${hits.join('')}]`);
  }
  fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(unique));
  console.log(`${name}: ${unique.length} words`);
  return unique;
}

const ecdict = await loadEcdict();
const lookup = w => ecdict.get(w.toLowerCase());
const ceec = parseCeec();
const ceecLevel = new Map(ceec.map(e => [e.word.toLowerCase(), e.level]));
const report = [];

// Row format: [word, partOfSpeech, meaning, level, phonetic]
const hsRows = [];
for (const e of ceec) {
  const ec = lookup(e.word);
  const meaning = buildMeaning(ec, e.pos);
  if (!meaning) { report.push(`highschool missing: ${e.word}`); continue; }
  hsRows.push([e.word, e.pos.join('/'), meaning, e.level, phonetic(ec)]);
}
const hs = writeBank('highschool', sortByLevelThenFrequency(hsRows));

const jrRows = [];
for (const e of parseJunior()) {
  const ec = lookup(e.word);
  const meaning = buildMeaning(ec, e.pos);
  if (!meaning) { report.push(`junior missing: ${e.word}`); continue; }
  const lv = ceecLevel.get(e.word.toLowerCase()) ?? 2;
  jrRows.push([e.word, e.pos.join('/') || (parseTranslation(ec.translation)[0]?.pos ?? ''), meaning, Math.min(lv, 3), phonetic(ec)]);
}
writeBank('junior', sortByLevelThenFrequency(jrRows));

const collinsLevel = ec => (ec.collins >= 4 ? 1 : ec.collins === 3 ? 2 : ec.collins === 2 ? 3 : ec.collins === 1 ? 4 : 5);
const tagged = (pred, levelFn) => {
  const rows = [];
  for (const ec of ecdict.values()) {
    if (!/^[a-z][a-z\-]*$/.test(ec.word) || !pred(ec)) continue;
    const groups = parseTranslation(ec.translation);
    if (!groups.length) continue;
    const pos = groups[0].pos;
    const meaning = buildMeaning(ec, pos ? [pos] : []);
    if (!meaning) continue;
    rows.push({ row: [ec.word, pos, meaning, levelFn(ec), phonetic(ec)], frq: ec.frq || ec.bnc || 999999 });
  }
  rows.sort((a, b) => a.row[3] - b.row[3] || a.frq - b.frq);
  return rows.map(r => r.row);
};

writeBank('toefl', tagged(ec => ec.tag.includes('toefl'), collinsLevel));
writeBank('daily', tagged(ec => ec.oxford, collinsLevel));

// --- NGSL TSL (TOEIC) / BSL (Business) ---------------------------------------
function parseNgslStats(file) {
  const lines = fs.readFileSync(path.join(ROOT, 'scripts', 'sources', file), 'utf8').split(/\r?\n/).slice(1);
  return lines
    .map(l => l.split(','))
    .filter(c => c[0] && /^\d+$/.test(c[1] || ''))
    .map(c => ({ word: c[0].trim(), rank: Number(c[1]) }));
}

function ngslRows(list, bankName) {
  const rows = [];
  const bandSize = Math.ceil(list.length / 5);
  for (const { word, rank } of list) {
    const ec = lookup(word);
    if (!ec) { report.push(`${bankName} missing: ${word}`); continue; }
    const groups = parseTranslation(ec.translation);
    const pos = groups[0]?.pos ?? '';
    const meaning = buildMeaning(ec, pos ? [pos] : []);
    if (!meaning) { report.push(`${bankName} missing: ${word}`); continue; }
    rows.push([word, pos, meaning, Math.min(5, Math.floor((rank - 1) / bandSize) + 1), phonetic(ec)]);
  }
  return rows;
}

const tsl = parseNgslStats('TSL_12_stats.csv');
const bsl = parseNgslStats('BSL_120_stats.csv');
// TOEIC = TSL (exam-specific) followed by BSL words not already in the TSL (business vocabulary the TOEIC draws on).
const tslKeys = new Set(tsl.map(x => x.word.toLowerCase()));
const tsRows = ngslRows(tsl, 'toeic');
const bslExtra = ngslRows(bsl.filter(x => !tslKeys.has(x.word.toLowerCase())), 'toeic').map(r => [r[0], r[1], r[2], Math.min(5, r[3] + 1), r[4]]);
writeBank('toeic', [...tsRows, ...bslExtra].sort((a, b) => a[3] - b[3]));
writeBank('business', ngslRows(bsl, 'business'));

fs.writeFileSync(path.join(CACHE, 'report.txt'), report.join('\n'), 'utf8');
console.log(`missing: ${report.length} (see .wordbank-cache/report.txt)`);
console.log('levels highschool:', [1, 2, 3, 4, 5, 6].map(l => hs.filter(r => r[3] === l).length).join(' / '));

fs.writeFileSync(path.join(CACHE, 'ambiguous-short-glosses.txt'), [...ambiguousShortGlosses].join('\n'), 'utf8');
fs.writeFileSync(path.join(CACHE, 'simplified-hits.txt'), simplifiedHits.join('\n'), 'utf8');
console.log(`simplified-chinese check: ${simplifiedHits.length} hits (see .wordbank-cache/simplified-hits.txt)`);
if (simplifiedHits.length) process.exitCode = 1;
