#!/usr/bin/env node
/* Minimal app diagnosis generator -> writes ./app_diagnosis.md */
const { execSync } = require('child_process');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const path = require('path');

const sh = (cmd) => {
  try { return String(execSync(cmd, { stdio: ['ignore','pipe','pipe'] })).trim(); }
  catch (e) { return `ERROR: ${e.stderr ? e.stderr.toString() : e.message}`; }
};

const root = process.cwd();
const file = (p) => path.join(root, p);

const has = (p) => existsSync(file(p));
const read = (p) => readFileSync(file(p), 'utf8');

function checkExport(filePath, wantedExports) {
  if (!has(filePath)) return { filePath, ok:false, reason: 'File not found' };
  const src = read(filePath);
  const res = {};
  wantedExports.forEach((name) => {
    const ok = new RegExp(`export\\s+(?:const|function|class|type|interface)\\s+${name}\\b`).test(src)
             || new RegExp(`export\\s*\\{[^}]*\\b${name}\\b[^}]*\\}`).test(src)
             || new RegExp(`export\\s+default\\s+${name}\\b`).test(src);
    res[name] = ok;
  });
  return { filePath, ok: Object.values(res).every(Boolean), details: res };
}

function section(title) { return `\n## ${title}\n`; }

(async () => {
  const nodeV = sh('node -v');
  const npmV = sh('npm -v');
  const nextInfo = sh('npx --yes next info');
  const gitStatus = sh('git status -sb');

  const checks = [];

  // 1) Exports requis (corrige les erreurs remontées)
  checks.push(checkExport('src/state/uiStore.ts', ['useUI']));
  checks.push(checkExport('lib/shortcuts.ts', ['onKey','combos']));
  checks.push(checkExport('lib/toast/ToastService.ts', ['Toasts','ToastViewport']));

  // 2) Imports critiques qui foiraient
  const importantFiles = [
    'components/CommandPalette.tsx',
    'components/AnimatedNavbar.tsx',
    'components/charts/EquityChart.tsx',
    'app/symbol/[symbol]/page.tsx',
    'app/item/[id]/page.tsx'
  ].filter(has);

  const importProblems = [];
  importantFiles.forEach((p) => {
    const src = read(p);
    // repère les alias @/ attendus
    const aliasImports = [...src.matchAll(/from\s+['"](@\/[^'"]+)['"]/g)].map((m) => m[1]);
    aliasImports.forEach((imp) => {
      // grossière vérif: si ça pointe vers src/* par tsconfig ? on log juste
      importProblems.push({ file:p, import:imp, note:'Check tsconfig.paths alias for @/*' });
    });
  });

  // 3) tsconfig paths (alias)
  let tsPaths = 'tsconfig.json missing';
  if (has('tsconfig.json')) {
    const ts = JSON.parse(read('tsconfig.json'));
    tsPaths = JSON.stringify(ts.compilerOptions?.paths || {}, null, 2);
  }

  // 4) Lint & typecheck (non bloquants)
  const lint = sh('npm run -s lint');
  // Tip: on évite un tsc isolé si pas configuré; Next gère le typecheck.

  // Compose Markdown
  let md = `# app_diagnosis\nGenerated: ${new Date().toISOString()}\n`;
  md += section('Environment');
  md += `- node: ${nodeV}\n- npm: ${npmV}\n\n`;
  md += '```\n' + nextInfo + '\n```\n';
  md += section('Git');
  md += '```\n' + gitStatus + '\n```\n';

  md += section('Required Exports');
  checks.forEach((c) => {
    md += `- ${c.filePath}: ${c.ok ? '✅' : '❌'}\n`;
    if (c.details) {
      Object.entries(c.details).forEach(([k,v]) => md += `  - export ${k}: ${v?'OK':'MISSING'}\n`);
    } else if (c.reason) {
      md += `  - ${c.reason}\n`;
    }
  });

  md += section('Alias & Imports to verify');
  if (importProblems.length === 0) md += '- No alias imports found in critical files\n';
  else importProblems.forEach(p => md += `- ${p.file}: \`${p.import}\`  (${p.note})\n`);

  md += section('tsconfig.paths (alias)');
  md += '```\n' + tsPaths + '\n```\n';

  md += section('ESLint (summary)');
  md += '```\n' + lint + '\n```\n';

  writeFileSync(file('app_diagnosis.md'), md);
  console.log('✔ app_diagnosis.md generated.');
})();
