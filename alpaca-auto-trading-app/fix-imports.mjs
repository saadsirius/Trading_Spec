#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const replacements = [
  // Fix toast imports
  {
    from: /from ['"]@\/lib\/toast\/ToastService['"]/g,
    to: "from '@/lib/toast/ToastService'"
  },
  // Fix shortcuts imports  
  {
    from: /from ['"]@\/lib\/shortcuts['"]/g,
    to: "from '@/lib/shortcuts'"
  },
  // Fix uiStore imports
  {
    from: /from ['"]@\/state\/uiStore['"]/g,
    to: "from '@/state/uiStore'"
  }
];

function fixFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    let changed = false;
    
    for (const { from, to } of replacements) {
      if (from.test(content)) {
        content = content.replace(from, to);
        changed = true;
      }
    }
    
    if (changed) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

function walkDir(dir) {
  const files = readdirSync(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
      fixFile(filePath);
    }
  }
}

console.log('Fixing import paths...');
walkDir('src');
console.log('Done!');
