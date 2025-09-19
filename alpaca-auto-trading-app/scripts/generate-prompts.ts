import { readFileSync, writeFileSync } from "fs";
type Svc = { name: string; file?: string; methods?: any[] };
type Hook = { name: string; file?: string; params?: string[]; returns?: string };
type TypeDef = { name: string; file?: string; fields?: {name:string;type:string}[] };
type Data = { services: Svc[]; hooks: Hook[]; types: TypeDef[] };

const data: Data = JSON.parse(readFileSync("knowledge.json","utf8"));

const out: string[] = [];
out.push("# 🧩 Cursor Prompts (auto)\n");
out.push("Utilise ces prompts directement dans Cursor pour accélérer ton dev.\n");

out.push("## ⚙️ Services");
for (const s of data.services) {
  out.push(`\n### ${s.name}`);
  if (s.methods?.length) {
    for (const m of s.methods) {
      out.push(`- **Prompt**: Refactorise \`${s.name}.${m.name}\` pour respecter SRP et ajoute des tests unitaires (Jest).`);
      out.push(`- **Prompt**: Ajoute des gardes sur \`${s.name}.${m.name}\` (types stricts, erreurs explicites) et logue via AnalyticsService.`);
    }
  } else {
    out.push(`- **Prompt**: Documente toutes les fonctions exportées de \`${s.name}\` et génère des JSDoc détaillés.`);
  }
}

out.push("\n## 🪝 Hooks");
for (const h of data.hooks) {
  out.push(`\n### ${h.name}`);
  out.push(`- **Prompt**: Ajoute un debounce/throttle sur ${h.name} (250–400ms) et couvre par des tests RTL.`);
  out.push(`- **Prompt**: Sépare effets UI/logique pure dans ${h.name}; renvoie une API typed-friendly.`);
}

out.push("\n## 🧾 Types");
for (const t of data.types) {
  out.push(`\n### ${t.name}`);
  out.push(`- **Prompt**: Vérifie l'usage de \`${t.name}\` dans le repo et traque les any implicites.`);
  out.push(`- **Prompt**: Génère un tableau de compatibilité de \`${t.name}\` avec les endpoints/handlers.`);
}

writeFileSync(".cursor-prompts.md", out.join("\n"));