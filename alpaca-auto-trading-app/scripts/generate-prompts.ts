import { readFileSync, writeFileSync } from "fs";
import chalk from "chalk";

type Svc = { name: string; file?: string; methods?: any[]; description?: string };
type Hook = { name: string; file?: string; params?: string[]; returns?: string; description?: string };
type TypeDef = { name: string; file?: string; fields?: {name:string;type:string}[]; description?: string };
type Component = { name: string; file?: string; props?: string; description?: string };
type Endpoint = { route: string; file?: string; methods?: string[] };
type Data = { 
  services: Svc[]; 
  hooks: Hook[]; 
  types: TypeDef[]; 
  components: Component[];
  utils: any[];
  endpoints: Endpoint[];
};

console.log(chalk.blue("🎯 Generating Cursor prompts..."));

const data: Data = JSON.parse(readFileSync("knowledge.json","utf8"));

const out: string[] = [];
out.push("# 🧩 Cursor Prompts (Auto-Generated)\n");
out.push("*Generated from codebase analysis*\n");
out.push("Utilise ces prompts directement dans Cursor pour accélérer ton développement.\n");

// Services prompts
if (data.services.length > 0) {
  out.push("## ⚙️ Services & Functions\n");
  for (const s of data.services) {
    out.push(`\n### ${s.name}`);
    if (s.description) out.push(`*${s.description}*\n`);
    
    if (s.methods?.length) {
      for (const m of s.methods) {
        out.push(`- **Refactor**: Refactorise \`${s.name}.${m.name}\` pour respecter SRP et ajoute des tests unitaires (Jest).`);
        out.push(`- **Security**: Ajoute des gardes sur \`${s.name}.${m.name}\` (types stricts, erreurs explicites) et logue via AnalyticsService.`);
        out.push(`- **Performance**: Optimise \`${s.name}.${m.name}\` avec debounce/throttle si nécessaire et ajoute du caching.`);
        out.push(`- **Documentation**: Génère des JSDoc détaillés pour \`${s.name}.${m.name}\` avec exemples d'usage.`);
      }
    } else {
      out.push(`- **Documentation**: Documente toutes les fonctions exportées de \`${s.name}\` et génère des JSDoc détaillés.`);
      out.push(`- **Testing**: Crée des tests unitaires complets pour \`${s.name}\` avec mocks appropriés.`);
    }
  }
}

// Hooks prompts
if (data.hooks.length > 0) {
  out.push("\n## 🪝 React Hooks\n");
  for (const h of data.hooks) {
    out.push(`\n### ${h.name}`);
    if (h.description) out.push(`*${h.description}*\n`);
    
    out.push(`- **Performance**: Ajoute un debounce/throttle sur ${h.name} (250–400ms) et couvre par des tests RTL.`);
    out.push(`- **Architecture**: Sépare effets UI/logique pure dans ${h.name}; renvoie une API typed-friendly.`);
    out.push(`- **Error Handling**: Ajoute une gestion d'erreur robuste dans ${h.name} avec fallbacks appropriés.`);
    out.push(`- **Testing**: Crée des tests pour ${h.name} avec React Testing Library et mocks des dépendances.`);
  }
}

// Components prompts
if (data.components.length > 0) {
  out.push("\n## ⚛️ React Components\n");
  for (const c of data.components) {
    out.push(`\n### ${c.name}`);
    if (c.description) out.push(`*${c.description}*\n`);
    
    out.push(`- **Performance**: Optimise ${c.name} avec React.memo, useMemo, useCallback si nécessaire.`);
    out.push(`- **Accessibility**: Améliore l'accessibilité de ${c.name} (ARIA, keyboard navigation, screen readers).`);
    out.push(`- **Responsive**: Rends ${c.name} responsive avec Tailwind CSS et breakpoints appropriés.`);
    out.push(`- **Testing**: Crée des tests E2E pour ${c.name} avec Cypress et tests unitaires avec RTL.`);
  }
}

// Types prompts
if (data.types.length > 0) {
  out.push("\n## 🧾 Types & Interfaces\n");
  for (const t of data.types) {
    out.push(`\n### ${t.name}`);
    if (t.description) out.push(`*${t.description}*\n`);
    
    out.push(`- **Validation**: Vérifie l'usage de \`${t.name}\` dans le repo et traque les any implicites.`);
    out.push(`- **Compatibility**: Génère un tableau de compatibilité de \`${t.name}\` avec les endpoints/handlers.`);
    out.push(`- **Evolution**: Crée des versions futures de \`${t.name}\` avec backward compatibility.`);
    out.push(`- **Documentation**: Ajoute des exemples d'usage pour \`${t.name}\` dans la documentation.`);
  }
}

// Utils prompts
if (data.utils.length > 0) {
  out.push("\n## 🛠️ Utilities\n");
  for (const u of data.utils) {
    out.push(`\n### ${u.name}`);
    if (u.description) out.push(`*${u.description}*\n`);
    
    out.push(`- **Testing**: Crée des tests unitaires exhaustifs pour ${u.name} avec edge cases.`);
    out.push(`- **Performance**: Optimise ${u.name} pour les performances et ajoute du benchmarking.`);
    out.push(`- **Error Handling**: Améliore la gestion d'erreur de ${u.name} avec des messages explicites.`);
    out.push(`- **Documentation**: Documente ${u.name} avec des exemples pratiques et cas d'usage.`);
  }
}

// API Endpoints prompts
if (data.endpoints.length > 0) {
  out.push("\n## 🌐 API Endpoints\n");
  for (const e of data.endpoints) {
    out.push(`\n### ${e.route}`);
    if (e.methods && e.methods.length > 0) {
      out.push(`*Methods: ${e.methods.join(", ")}*\n`);
    }
    
    out.push(`- **Validation**: Ajoute une validation Zod stricte pour ${e.route} avec messages d'erreur clairs.`);
    out.push(`- **Rate Limiting**: Implémente un rate limiting pour ${e.route} avec Redis et gestion des quotas.`);
    out.push(`- **Monitoring**: Ajoute des métriques Prometheus pour ${e.route} (latence, erreurs, throughput).`);
    out.push(`- **Testing**: Crée des tests d'intégration pour ${e.route} avec mocks des services externes.`);
  }
}

// General prompts
out.push("\n## 🚀 General Development Prompts\n");
out.push("\n### Code Quality");
out.push("- **Refactor**: Refactorise ce code pour améliorer la lisibilité et maintenabilité.");
out.push("- **Optimize**: Optimise ce code pour les performances (bundle size, runtime, memory).");
out.push("- **Secure**: Sécurise ce code contre les vulnérabilités courantes (XSS, CSRF, injection).");

out.push("\n### Testing");
out.push("- **Unit Tests**: Crée des tests unitaires complets avec Jest et React Testing Library.");
out.push("- **Integration Tests**: Crée des tests d'intégration pour les APIs et services.");
out.push("- **E2E Tests**: Crée des tests end-to-end avec Cypress pour les parcours utilisateur.");

out.push("\n### Performance");
out.push("- **Bundle Analysis**: Analyse la taille du bundle et identifie les optimisations possibles.");
out.push("- **Lighthouse**: Améliore les scores Lighthouse (Performance, Accessibility, SEO).");
out.push("- **Core Web Vitals**: Optimise les Core Web Vitals (LCP, FID, CLS).");

out.push("\n### Architecture");
out.push("- **Clean Architecture**: Applique les principes de Clean Architecture à ce module.");
out.push("- **SOLID Principles**: Refactorise pour respecter les principes SOLID.");
out.push("- **Design Patterns**: Applique les design patterns appropriés (Factory, Observer, Strategy).");

// Footer
out.push("\n---\n");
out.push("*Ces prompts sont générés automatiquement à partir de l'analyse du codebase.*");
out.push("*Utilise-les avec Cursor pour accélérer ton développement et améliorer la qualité du code.*");

writeFileSync(".cursor-prompts.md", out.join("\n"));
console.log(chalk.green("✅ .cursor-prompts.md generated"));
console.log(chalk.blue("📝 Generated prompts for:"));
console.log(`   - ${data.services.length} services`);
console.log(`   - ${data.hooks.length} hooks`);
console.log(`   - ${data.components.length} components`);
console.log(`   - ${data.types.length} types`);
console.log(`   - ${data.utils.length} utilities`);
console.log(`   - ${data.endpoints.length} endpoints`);
