// Scans src/ for Simplified Chinese characters. Exit code 1 when anything is found.
// Usage: node scripts/check-traditional.mjs [--json-report path]
import fs from 'node:fs';
import path from 'node:path';
import * as OpenCC from 'opencc-js';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const cnToTw = OpenCC.Converter({ from: 'cn', to: 'tw' });
const BLOCKLIST = '们这说时会为发经过还动个国学习东车门问开关见长张书读写听语话词亿边应该么来对没实现机电钱区达热众让认识产业务员价单级场岁归弃农';

// Characters that are valid in Traditional Chinese text even though OpenCC's cn→tw would rewrite them in some contexts.
const ALLOWED = new Set([...'只台著於占游周干后里面系征采松准制志冲谷余丑卜几托伙表念岩划欲熏']);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(tsx?|json|css|html)$/.test(entry.name)) out.push(full);
  }
  return out;
}

// traditional.ts holds the Simplified → Traditional phrase table itself.
const EXCLUDED = [path.join('src', 'utils', 'traditional.ts')];
const files = [...walk(path.join(ROOT, 'src')), path.join(ROOT, 'index.html')].filter(
  f => fs.existsSync(f) && !EXCLUDED.includes(path.relative(ROOT, f))
);
const hits = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    const runs = line.match(/[\u3400-\u9fff]+/g);
    if (!runs) return;
    for (const run of runs) {
      const converted = [...cnToTw(run)];
      const bad = [...run].filter((ch, idx) => BLOCKLIST.includes(ch) || (converted[idx] !== ch && !ALLOWED.has(ch)));
      if (bad.length) {
        hits.push({ file: path.relative(ROOT, file), line: i + 1, run, chars: [...new Set(bad)].join(''), suggestion: cnToTw(run) });
      }
    }
  });
}

const reportArg = process.argv.indexOf('--json-report');
if (reportArg > 0) fs.writeFileSync(process.argv[reportArg + 1], JSON.stringify(hits, null, 2), 'utf8');
console.log(`Simplified Chinese check: ${hits.length} hit(s) in ${files.length} files`);
for (const h of hits.slice(0, 200)) console.log(`${h.file}:${h.line}  ${h.run}  [${h.chars}] → ${h.suggestion}`);
if (hits.length) process.exitCode = 1;
