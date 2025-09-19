/**
 * File: scripts/add-file-headers.ts
 * Description: Inject a file header (with relative path) if missing.
 * Usage: node scripts/add-file-headers.ts
 */
import { promises as fs } from 'fs';
import path from 'path';

const exts = new Set(['.ts', '.tsx', '.css', '.md']);

function headerFor(file: string) {
  const ext = path.extname(file);
  const rel = file.replace(/^\.?\//, '');
  const base = `File: ${rel}\n * Description: `;
  if (ext === '.md') return `<!--\n * ${base}\n-->\n\n`;
  // css / ts / tsx: use block comment
  return `/**\n * ${base}\n */\n`;
}

async function hasHeader(content: string) {
  return content.startsWith('/**') || content.startsWith('/*') || content.startsWith('<!--');
}

async function* walk(dir: string) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.next', 'dist', '.git', 'coverage'].includes(entry.name)) continue;
      yield* walk(p);
    } else {
      if (!exts.has(path.extname(p))) continue;
      yield p;
    }
  }
}

async function main() {
  const root = process.cwd();
  for await (const file of walk(root)) {
    const text = await fs.readFile(file, 'utf8');
    if (await hasHeader(text)) continue;
    const hdr = headerFor(path.relative(root, file));
    await fs.writeFile(file, hdr + text, 'utf8');
    console.log('📎 header added:', file);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
