// Regenerates the inlined Tailwind CSS block in index.html.
// The page used to load Tailwind from a CDN at runtime, which sent every
// visitor's IP address to a third party. Now the utilities are compiled
// once and inlined between the two markers below.
//
// Usage (only needed after adding or changing Tailwind classes):
//   node scripts/build-css.mjs
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const html = 'index.html';
const dir = mkdtempSync(join(tmpdir(), 'tw-'));
const input = join(dir, 'in.css');
const output = join(dir, 'out.css');
writeFileSync(input, '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
execFileSync('npx', ['--yes', 'tailwindcss@3.4.17', '-i', input, '-o', output, '--content', html, '--minify'], { stdio: 'inherit' });
const css = readFileSync(output, 'utf8');
const src = readFileSync(html, 'utf8');
const START = '<style id="tw">', END = '</style><!-- /tw -->';
const a = src.indexOf(START), b = src.indexOf(END);
if (a < 0 || b < 0) throw new Error('tw markers not found in index.html');
writeFileSync(html, src.slice(0, a + START.length) + css + src.slice(b));
console.log('inlined', css.length, 'bytes of Tailwind CSS');
