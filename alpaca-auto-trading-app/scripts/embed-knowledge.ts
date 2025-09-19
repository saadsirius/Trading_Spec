import { readFileSync, writeFileSync } from "fs";
import { pipeline } from "@xenova/transformers";

if (process.env.SKIP_EMBED) {
  console.log("⏩ Skip embeddings (SKIP_EMBED=1)");
  process.exit(0);
}

const MODEL = "Xenova/all-MiniLM-L6-v2";

function chunkText(text: string, maxLen = 800) {
  const lines = text.split("\n");
  const chunks: string[] = [];
  let buf = "";
  for (const ln of lines) {
    if ((buf + "\n" + ln).length > maxLen) { chunks.push(buf); buf = ln; }
    else buf += (buf ? "\n" : "") + ln;
  }
  if (buf) chunks.push(buf);
  return chunks.filter(c => c.trim().length > 0);
}

async function main() {
  const md = readFileSync("knowledge.md", "utf8");
  const chunks = chunkText(md, 900);
  const embedder: any = await pipeline("feature-extraction", MODEL);
  const out: any[] = [];
  for (let i=0;i<chunks.length;i++) {
    const res = await embedder(chunks[i], { pooling: "mean", normalize: true });
    const embedding = Array.from(res.data);
    out.push({ id: `chunk_${i}`, text: chunks[i], embedding });
  }
  writeFileSync("vector/knowledge_embeddings.json", JSON.stringify(out, null, 2));
  console.log("🧲 Embeddings written → vector/knowledge_embeddings.json");
}

main().catch(e => { console.error(e); process.exit(1); });