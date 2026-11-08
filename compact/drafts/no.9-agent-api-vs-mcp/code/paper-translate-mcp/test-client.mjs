// Claude Desktop の代わりに、SDK の MCP クライアントからサーバを起動して3つのツールを順に呼ぶ
// work/papers/sample.pdf と work/glossary.json を置いてから `npm test` で動かす
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const transport = new StdioClientTransport({
  command: "node",
  args: ["index.js"],
  env: { ...process.env, PAPER_DIR: "work" },
});
const client = new Client({ name: "test-client", version: "0.1.0" });
await client.connect(transport);

const { tools } = await client.listTools();
console.log("tools:", tools.map((t) => t.name));

const doc = await client.callTool({ name: "read_document", arguments: { file: "sample.pdf" } });
console.log(doc.content[0].text);

const glossary = await client.callTool({ name: "get_glossary", arguments: {} });
console.log(glossary.content[0].text);

const saved = await client.callTool({
  name: "save_translation",
  arguments: { file: "sample.pdf", text: "# sample.pdf の訳\n\nリザバーコンピューティングは、…" },
});
console.log(saved.content[0].text);

// フォルダの外のファイルは読めないことを確かめる
const escaped = await client.callTool({ name: "read_document", arguments: { file: "../glossary.json" } });
console.log("isError:", escaped.isError, escaped.content[0].text);

await client.close();
