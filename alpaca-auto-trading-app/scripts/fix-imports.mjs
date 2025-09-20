// scripts/fix-imports.mjs
import fs from 'node:fs';
import path from 'node:path';

const exts = new Set(['.ts', '.tsx', '.js', '.jsx']);
const root = process.cwd();
const srcDir = path.join(root, 'src');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, files);
    else if (exts.has(path.extname(p))) files.push(p);
  }
  return files;
}

function fix(content) {
  // 1) "@/src/..." -> "@/..."
  content = content.replace(/from\s+['"]@\/src\//g, "from '@/");

  // 2) imports that should use alias but point to "../../components" etc.
  //   Heuristic: replace "../../../components/" to "@/components/"
  content = content.replace(/from\s+['"](\.{1,}\/)+components\//g, "from '@/components/");
  content = content.replace(/from\s+['"](\.{1,}\/)+lib\//g, "from '@/lib/");
  content = content.replace(/from\s+['"](\.{1,}\/)+state\//g, "from '@/state/");

  return content;
}

const files = [
  ...walk(path.join(root, 'app')),
  ...walk(srcDir)
];

for (const f of files) {
  const old = fs.readFileSync(f, 'utf8');
  const next = fix(old);
  if (old !== next) {
    fs.writeFileSync(f, next);
    console.log('fixed:', path.relative(root, f));
  }
}
