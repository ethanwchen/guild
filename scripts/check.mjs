#!/usr/bin/env node
/*
 * Self-check for the guild repo: every crew file and skill has valid frontmatter, no crew
 * member can spawn agents, models are known, and no Markdown uses the em dash character.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MODELS = new Set(["fable", "opus", "sonnet", "haiku", "inherit"]);
const FORBIDDEN_TOOLS = new Set(["Agent", "Task", "Workflow"]);
const errors = [];
const fail = (file, msg) => errors.push(`${relative(ROOT, file)}: ${msg}`);

const files = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (n === "node_modules" || n === ".git") return [];
    return statSync(p).isDirectory() ? files(p) : [p];
  });
const front = (text) => {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? m[1] : null;
};
const field = (head, key) => {
  const m = head.match(new RegExp(`^${key}:\s*(.*)$`, "m"));
  return m ? m[1].trim() : undefined;
};

for (const f of files(join(ROOT, "crew")).filter((p) => p.endsWith(".md"))) {
  const head = front(readFileSync(f, "utf8"));
  if (!head) { fail(f, "missing frontmatter"); continue; }
  const name = field(head, "name");
  if (name !== basename(f, ".md")) fail(f, `name "${name}" does not match the file name`);
  if (!field(head, "description")) fail(f, "missing description");
  const model = field(head, "model");
  if (!MODELS.has(model)) fail(f, `unknown model "${model}"`);
  const tools = (field(head, "tools") || "").split(",").map((t) => t.trim()).filter(Boolean);
  for (const t of tools) if (FORBIDDEN_TOOLS.has(t)) fail(f, `crew members may not have the ${t} tool (flat tree rule)`);
  const kind = (head.match(/^\s+kind:\s*(\w+)/m) || [])[1];
  if (kind !== "worker" && kind !== "validator") fail(f, "guild.kind must be worker or validator");
}

for (const f of files(join(ROOT, "skills")).filter((p) => basename(p) === "SKILL.md")) {
  const head = front(readFileSync(f, "utf8"));
  if (!head) { fail(f, "missing frontmatter"); continue; }
  if (field(head, "name") !== basename(dirname(f))) fail(f, "name does not match the folder name");
  const d = field(head, "description") || "";
  if (!d) fail(f, "missing description");
  if (d.length > 500) fail(f, `description is ${d.length} characters (max 500)`);
}

for (const f of files(ROOT).filter((p) => /\.(md|js|mjs|json)$/.test(p))) {
  if (readFileSync(f, "utf8").includes(String.fromCharCode(0x2014))) fail(f, "contains an em dash; use a plain dash");
}

/* Workflow scripts run inside an async body with a top-level return, so parse them that way. */
for (const f of files(join(ROOT, "workflows")).filter((p) => p.endsWith(".js"))) {
  const src = readFileSync(f, "utf8").replace(/^export const meta/m, "const meta");
  try {
    new Function("args", "agent", "parallel", "pipeline", "phase", "log", "budget", "workflow", `return (async () => {
${src}
})`);
  } catch (e) {
    fail(f, `does not parse: ${e.message}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} problem(s)`);
  process.exit(1);
}
console.log("guild check passed");
