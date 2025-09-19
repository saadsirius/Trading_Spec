import { Project } from "ts-morph";
import fs from "fs-extra";
import { globby } from "globby";
import chalk from "chalk";

const project = new Project({ tsConfigFilePath: "./tsconfig.json" });

async function main() {
  console.log(chalk.blue("🔍 Scanning TypeScript files..."));
  
  const files = await globby(["src/**/*.ts", "src/**/*.tsx", "app/**/*.ts", "app/**/*.tsx"]);
  const data: any = { 
    services: [], 
    hooks: [], 
    types: [], 
    endpoints: [],
    components: [],
    utils: []
  };

  console.log(chalk.yellow(`📁 Found ${files.length} files to analyze`));

  // Process files in batches to avoid memory issues
  const batchSize = 50;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    console.log(chalk.gray(`   Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(files.length/batchSize)} (${batch.length} files)...`));
    
    for (const path of batch) {
    try {
      const source = project.addSourceFileAtPath(path);

      // Classes -> services
      for (const cls of source.getClasses()) {
        const methods = cls.getMethods().map(m => ({
          name: m.getName(),
          params: m.getParameters().map(p => ({
            name: p.getName(),
            type: p.getType().getText(),
            optional: p.hasQuestionToken()
          })),
          returns: m.getReturnType().getText(),
          description: m.getJsDocs().map(d => d.getComment()).join(" ").trim(),
          isAsync: m.isAsync(),
          isStatic: m.isStatic()
        }));
        
        data.services.push({ 
          file: path, 
          name: cls.getName(), 
          methods,
          description: cls.getJsDocs().map(d => d.getComment()).join(" ").trim(),
          isExported: cls.isExported()
        });
      }

      // Functions (hooks vs services vs utils)
      for (const f of source.getFunctions()) {
        const name = f.getName() || "anonymous";
        const item = {
          file: path,
          name,
          params: f.getParameters().map(p => ({
            name: p.getName(),
            type: p.getType().getText(),
            optional: p.hasQuestionToken()
          })),
          returns: f.getReturnType().getText(),
          description: f.getJsDocs().map(d => d.getComment()).join(" ").trim(),
          isAsync: f.isAsync(),
          isExported: f.isExported()
        };
        
        if (name.startsWith("use")) {
          data.hooks.push(item);
        } else if (path.includes("/utils/") || path.includes("/lib/")) {
          data.utils.push(item);
        } else {
          data.services.push({ file: path, name, methods: [item] });
        }
      }

      // Interfaces/types
      for (const i of source.getInterfaces()) {
        const fields = i.getProperties().map(p => ({
          name: p.getName(),
          type: p.getType().getText(),
          optional: p.hasQuestionToken()
        }));
        data.types.push({ 
          file: path, 
          name: i.getName(), 
          fields,
          description: i.getJsDocs().map(d => d.getComment()).join(" ").trim(),
          isExported: i.isExported()
        });
      }

      // Type aliases
      for (const t of source.getTypeAliases()) {
        data.types.push({
          file: path,
          name: t.getName(),
          type: t.getType().getText(),
          description: t.getJsDocs().map(d => d.getComment()).join(" ").trim(),
          isExported: t.isExported()
        });
      }

      // React Components (heuristic)
      for (const f of source.getFunctions()) {
        const name = f.getName();
        if (name && (name[0] === name[0].toUpperCase() || name.includes("Component"))) {
          data.components.push({
            file: path,
            name,
            props: f.getParameters().find(p => p.getName() === "props")?.getType().getText() || "unknown",
            description: f.getJsDocs().map(d => d.getComment()).join(" ").trim(),
            isExported: f.isExported()
          });
        }
      }

      // Heuristique Next.js API routes
      if (path.includes("/pages/api/") || path.includes("/app/api/")) {
        const routeName = path.split("/").pop()?.replace(/\.(ts|tsx)$/, "") || "unknown";
        data.endpoints.push({ 
          file: path, 
          route: routeName,
          methods: source.getFunctions().map(f => f.getName()).filter(Boolean)
        });
      }
    } catch (error) {
      console.warn(chalk.yellow(`⚠️  Could not parse ${path}: ${error}`));
    }
    }
    
    // Clear project to free memory after each batch
    for (const path of batch) {
      try {
        const sourceFile = project.getSourceFile(path);
        if (sourceFile) {
          project.removeSourceFile(sourceFile);
        }
      } catch (e) {
        // Ignore errors when removing files
      }
    }
  }

  // Write JSON knowledge base
  fs.writeFileSync("knowledge.json", JSON.stringify(data, null, 2));
  console.log(chalk.green("✅ knowledge.json generated"));

  // Generate Markdown documentation
  const md: string[] = [];
  md.push("# 🧠 Knowledge Extract\n");
  md.push(`*Generated on ${new Date().toISOString()}*\n`);

  // Services & Functions
  if (data.services.length > 0) {
    md.push("## 🔧 Services & Functions\n");
    for (const svc of data.services) {
      md.push(`\n### ${svc.name}`);
      if (svc.file) md.push(`- **File**: \`${svc.file}\``);
      if (svc.description) md.push(`- **Description**: ${svc.description}`);
      if (svc.isExported) md.push(`- **Exported**: ✅`);
      
      const arr = svc.methods ?? [];
      if (arr.length > 0) {
        md.push("- **Methods**:");
        for (const m of arr) {
          const params = m.params?.map((p: any) => `${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(", ") || "";
          md.push(`  - \`${m.name}(${params})\` → \`${m.returns}\``);
          if (m.description) md.push(`    > ${m.description}`);
          if (m.isAsync) md.push(`    > *async function*`);
        }
      }
    }
  }

  // Hooks
  if (data.hooks.length > 0) {
    md.push("\n## 🪝 React Hooks\n");
    for (const h of data.hooks) {
      md.push(`\n### ${h.name}`);
      md.push(`- **File**: \`${h.file}\``);
      const params = h.params?.map((p: any) => `${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(", ") || "none";
      md.push(`- **Params**: ${params}`);
      md.push(`- **Returns**: \`${h.returns}\``);
      if (h.description) md.push(`- **Description**: ${h.description}`);
      if (h.isAsync) md.push(`- **Async**: ✅`);
      if (h.isExported) md.push(`- **Exported**: ✅`);
    }
  }

  // Components
  if (data.components.length > 0) {
    md.push("\n## ⚛️ React Components\n");
    for (const c of data.components) {
      md.push(`\n### ${c.name}`);
      md.push(`- **File**: \`${c.file}\``);
      md.push(`- **Props**: \`${c.props}\``);
      if (c.description) md.push(`- **Description**: ${c.description}`);
      if (c.isExported) md.push(`- **Exported**: ✅`);
    }
  }

  // Types
  if (data.types.length > 0) {
    md.push("\n## 🧾 Types & Interfaces\n");
    for (const t of data.types) {
      md.push(`\n### ${t.name}`);
      md.push(`- **File**: \`${t.file}\``);
      if (t.description) md.push(`- **Description**: ${t.description}`);
      if (t.isExported) md.push(`- **Exported**: ✅`);
      
      if (t.fields) {
        md.push("- **Fields**:");
        for (const f of t.fields) {
          md.push(`  - \`${f.name}${f.optional ? '?' : ''}: ${f.type}\``);
        }
      } else if (t.type) {
        md.push(`- **Type**: \`${t.type}\``);
      }
    }
  }

  // Utils
  if (data.utils.length > 0) {
    md.push("\n## 🛠️ Utilities\n");
    for (const u of data.utils) {
      md.push(`\n### ${u.name}`);
      md.push(`- **File**: \`${u.file}\``);
      const params = u.params?.map((p: any) => `${p.name}${p.optional ? '?' : ''}: ${p.type}`).join(", ") || "none";
      md.push(`- **Params**: ${params}`);
      md.push(`- **Returns**: \`${u.returns}\``);
      if (u.description) md.push(`- **Description**: ${u.description}`);
      if (u.isAsync) md.push(`- **Async**: ✅`);
      if (u.isExported) md.push(`- **Exported**: ✅`);
    }
  }

  // API Endpoints
  if (data.endpoints.length > 0) {
    md.push("\n## 🌐 API Endpoints\n");
    for (const e of data.endpoints) {
      md.push(`\n### ${e.route}`);
      md.push(`- **File**: \`${e.file}\``);
      if (e.methods && e.methods.length > 0) {
        md.push(`- **Methods**: ${e.methods.join(", ")}`);
      }
    }
  }

  // Statistics
  md.push("\n## 📊 Statistics\n");
  md.push(`- **Services**: ${data.services.length}`);
  md.push(`- **Hooks**: ${data.hooks.length}`);
  md.push(`- **Components**: ${data.components.length}`);
  md.push(`- **Types**: ${data.types.length}`);
  md.push(`- **Utils**: ${data.utils.length}`);
  md.push(`- **API Endpoints**: ${data.endpoints.length}`);
  md.push(`- **Total Files Analyzed**: ${files.length}`);

  fs.writeFileSync("knowledge.md", md.join("\n"));
  console.log(chalk.green("✅ knowledge.md generated"));

  console.log(chalk.greenBright("📘 Documentation updated successfully!"));
  console.log(chalk.blue("📊 Summary:"));
  console.log(`   - Services: ${data.services.length}`);
  console.log(`   - Hooks: ${data.hooks.length}`);
  console.log(`   - Components: ${data.components.length}`);
  console.log(`   - Types: ${data.types.length}`);
  console.log(`   - Utils: ${data.utils.length}`);
  console.log(`   - API Endpoints: ${data.endpoints.length}`);
}

main().catch(e => {
  console.error(chalk.red("❌ Error:"), e);
  process.exit(1);
});
