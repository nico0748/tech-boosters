#!/usr/bin/env node
// 論文翻訳の MCP サーバ（最小構成）
// 推論（翻訳そのもの）はしない。PDF を読む・用語集を渡す・訳を保存する、の3つだけ
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { readFile, writeFile, appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { extractText, getDocumentProxy } from "unpdf";

// 作業フォルダ。この外のファイルには触らない
const ROOT = path.resolve(process.env.PAPER_DIR ?? process.cwd());
const PAPERS = path.join(ROOT, "papers");
const OUT = path.join(ROOT, "translations");

// ファイル名だけを受け付け、「../」などでフォルダの外に出られないようにする
function safeName(name) {
  const base = path.basename(name);
  if (base !== name || base.startsWith(".")) {
    throw new Error(`ファイル名だけを指定してください: ${name}`);
  }
  return base;
}

// 段落に分ける（空行、または行末の「.」で区切る）
function toParagraphs(text) {
  return text
    .split(/\n\s*\n|(?<=\.)\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter((p) => p.length > 0);
}

const server = new McpServer({ name: "paper-translate", version: "0.1.0" });

server.registerTool(
  "read_document",
  {
    description:
      "papers/ にある英語論文の PDF を読み、段落の配列を返す。長い論文は start と count で少しずつ読む",
    inputSchema: {
      file: z.string().describe("papers/ の中の PDF のファイル名"),
      start: z.number().int().min(0).default(0).describe("何段落目から読むか"),
      count: z.number().int().min(1).max(50).default(20).describe("何段落読むか"),
    },
    annotations: { readOnlyHint: true },
  },
  async ({ file, start, count }) => {
    const buf = await readFile(path.join(PAPERS, safeName(file)));
    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await extractText(pdf, { mergePages: true });
    const paragraphs = toParagraphs(text);
    const result = {
      file,
      total: paragraphs.length,
      start,
      paragraphs: paragraphs.slice(start, start + count),
      next: start + count < paragraphs.length ? start + count : null,
    };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
);

server.registerTool(
  "get_glossary",
  {
    description: "訳語をそろえるための用語集（英語→日本語）を返す。訳す前に一度呼ぶ",
    inputSchema: {},
    annotations: { readOnlyHint: true },
  },
  async () => {
    let glossary = {};
    try {
      glossary = JSON.parse(await readFile(path.join(ROOT, "glossary.json"), "utf8"));
    } catch {
      // 用語集がなければ空で返す
    }
    return { content: [{ type: "text", text: JSON.stringify(glossary, null, 2) }] };
  }
);

server.registerTool(
  "save_translation",
  {
    description:
      "訳した日本語を translations/ に Markdown で保存する。続きを足すときは append を true にする",
    inputSchema: {
      file: z.string().describe("元の PDF のファイル名"),
      text: z.string().describe("訳した日本語（Markdown）"),
      append: z.boolean().default(false).describe("既存の訳の後ろに足すなら true"),
    },
    annotations: { readOnlyHint: false, destructiveHint: false },
  },
  async ({ file, text, append }) => {
    const name = safeName(file).replace(/\.pdf$/i, "") + ".ja.md";
    await mkdir(OUT, { recursive: true });
    const dest = path.join(OUT, name);
    await (append ? appendFile : writeFile)(dest, text + "\n", "utf8");
    return { content: [{ type: "text", text: `translations/${name} に保存しました` }] };
  }
);

// stdio でホスト（Claude Desktop など）とつなぐ
// stdout は JSON-RPC 専用なので、ログは必ず stderr に出す
await server.connect(new StdioServerTransport());
console.error(`paper-translate MCP server started (PAPER_DIR=${ROOT})`);
