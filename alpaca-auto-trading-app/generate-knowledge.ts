import { Project } from "ts-morph";
import fs from "fs-extra";
import { globby } from "globby";
import chalk from "chalk";

const project = new Project({ tsConfigFilePath: "./tsconfig.json" });

async function main() {
  const files = await globby([
    "src/**/*.ts",
    "src/**/*.tsx",
    "!src/**/*.test.*",
    "!src/**/*.spec.*",
    "!src/**/__tests__/**",
    "!src/**/__mocks__/**",
    "!src/**/*.stories.*",
    "!dist/**",
    "!.next/**",
    "!coverage/**",
    "!node_modules/**"
  ]);

  const data: any = {
    schemaVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    services: [],
    hooks: [],
    types: [],
    endpoints: [],
    files: []
  };

  for (const path of files) {
    try {
      const source = project.addSourceFileAtPath(path);

      // Dépendances (imports) par fichier
      const imports = source.getImportDeclarations().map(d => d.getModuleSpecifierValue());
      data.files.push({ file: path, imports });

      // Classes -> services
      for (const cls of source.getClasses()) {
        const methods = cls.getMethods().map(m => ({
          name: m.getName(),
          params: m.getParameters().map(p => p.getText()),
          returns: m.getReturnType().getText(),
          description: m.getJsDocs().map(d => d.getComment()).join(" ").trim()
        }));
        data.services.push({ file: path, name: cls.getName(), methods });
      }

      // Fonctions (hooks vs services)
      for (const f of source.getFunctions()) {
        const name = f.getName() || "anonymous";
        const item = {
          file: path,
          name,
          params: f.getParameters().map(p => p.getText()),
          returns: f.getReturnType().getText(),
          description: f.getJsDocs().map(d => d.getComment()).join(" ").trim()
        };
        if (name.startsWith("use")) data.hooks.push(item);
        else data.services.push({ file: path, name, methods: [item] });
      }

      // Interfaces/types
      for (const i of source.getInterfaces()) {
        const fields = i.getProperties().map(p => ({
          name: p.getName(),
          type: p.getType().getText()
        }));
        data.types.push({ file: path, name: i.getName(), fields });
      }

      // Heuristique Next.js API routes
      if (path.includes("/pages/api/") || path.includes("/app/api/")) {
        data.endpoints.push({ file: path });
      }
    } catch (e) {
      console.warn(`⚠️  Skipped ${path}: ${(e as Error).message}`);
    }
  }

  // Sorties déterministes
  data.services.sort((a:any,b:any)=> (a.name||"").localeCompare(b.name||"") || (a.file||"").localeCompare(b.file||""));
  data.hooks.sort((a:any,b:any)=> (a.name||"").localeCompare(b.name||""));
  data.types.sort((a:any,b:any)=> (a.name||"").localeCompare(b.name||""));
  data.endpoints.sort((a:any,b:any)=> (a.file||"").localeCompare(b.file||""));
  data.files.sort((a:any,b:any)=> (a.file||"").localeCompare(b.file||""));

  fs.writeFileSync("knowledge.json", JSON.stringify(data, null, 2));

  // Markdown compact et stable
  const md: string[] = [];
  md.push("# 🧠 Knowledge Extract\n");
  md.push(`_schema: ${data.schemaVersion} • generated: ${data.generatedAt}_\n`);

  md.push("## Services & Functions");
  for (const svc of data.services) {
    md.push(`\n### ${svc.name}`);
    if (svc.file) md.push(`- File: \`${svc.file}\``);
    const arr = svc.methods ?? [];
    for (const m of arr) {
      md.push(`- **${m.name}(${(m.params||[]).join(", ")})**: \`${m.returns}\``);
      if (m.description) md.push(`  > ${m.description}`);
    }
  }

  md.push("\n## Hooks");
  for (const h of data.hooks) {
    md.push(`\n### ${h.name}`);
    md.push(`- File: \`${h.file}\``);
    md.push(`- Params: ${(h.params||[]).join(", ") || "none"}`);
    md.push(`- Returns: \`${h.returns}\``);
    if (h.description) md.push(`  > ${h.description}`);
  }

  md.push("\n## Types");
  for (const t of data.types) {
    md.push(`\n### ${t.name}`);
    md.push(`- File: \`${t.file}\``);
    for (const f of t.fields) md.push(`- ${f.name}: \`${f.type}\``);
  }

  if (data.endpoints.length) {
    md.push("\n## API Endpoints (heuristique)");
    for (const e of data.endpoints) md.push(`- \`${e.file}\``);
  }

  writeFileSync("knowledge.md", md.join("\n"));
  console.log(chalk.greenBright("📘 Documentation updated (knowledge.json, knowledge.md)"));
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});