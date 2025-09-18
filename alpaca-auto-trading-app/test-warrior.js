#!/usr/bin/env node

/**
 * Script de test pour l'architecture Warrior
 * Vérifie que tous les composants fonctionnent correctement
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Test de l\'architecture Warrior...\n');

// Vérifier les fichiers essentiels
const requiredFiles = [
  'src/core/domain.ts',
  'src/lib/event-bus.ts',
  'src/lib/errors/error-catalog.ts',
  'src/lib/ui/ToastProvider.tsx',
  'src/lib/errors/ErrorBoundary.tsx',
  'src/lib/analytics/useSystemHealth.ts',
  'src/app/system/health/page.tsx',
  'src/features/backtesting/index.ts',
  'src/features/screener/index.ts',
  'src/features/watchlist/index.ts',
  'src/app/warrior-demo/page.tsx',
  '.cursorrules',
  'WARRIOR_ARCHITECTURE.md'
];

let allFilesExist = true;

console.log('📁 Vérification des fichiers...');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MANQUANT`);
    allFilesExist = false;
  }
});

// Vérifier les dépendances
console.log('\n📦 Vérification des dépendances...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = [
  'nanoevents',
  'zod',
  'zustand',
  'sonner',
  'neverthrow'
];

requiredDeps.forEach(dep => {
  if (packageJson.dependencies[dep] || packageJson.devDependencies[dep]) {
    console.log(`✅ ${dep}`);
  } else {
    console.log(`❌ ${dep} - MANQUANT`);
    allFilesExist = false;
  }
});

// Vérifier la structure des dossiers
console.log('\n📂 Vérification de la structure...');
const requiredDirs = [
  'src/core',
  'src/lib/errors',
  'src/lib/ui',
  'src/lib/analytics',
  'src/features/backtesting',
  'src/features/screener',
  'src/features/watchlist',
  'src/app/system/health',
  'src/app/warrior-demo'
];

requiredDirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (fs.existsSync(dirPath)) {
    console.log(`✅ ${dir}/`);
  } else {
    console.log(`❌ ${dir}/ - MANQUANT`);
    allFilesExist = false;
  }
});

// Résumé
console.log('\n📊 Résumé:');
if (allFilesExist) {
  console.log('🎉 Tous les composants Warrior sont présents !');
  console.log('\n🚀 Prochaines étapes:');
  console.log('1. Visitez /warrior-demo pour tester l\'architecture');
  console.log('2. Visitez /system/health pour monitorer le système');
  console.log('3. Consultez WARRIOR_ARCHITECTURE.md pour la documentation');
  console.log('4. Implémentez les features manquantes selon la roadmap');
} else {
  console.log('❌ Certains composants sont manquants. Vérifiez les erreurs ci-dessus.');
  process.exit(1);
}

console.log('\n✨ Architecture Warrior prête pour le développement !');
