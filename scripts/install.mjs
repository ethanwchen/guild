#!/usr/bin/env node
/*
 * Installs guild into a project.
 *
 *   node scripts/install.mjs <project-dir> [--factory] [--force] [--check]
 *
 * Claude Code:  crew/*.md -> .claude/agents/, skills/* -> .claude/skills/,
 *               workflows/* -> .claude/workflows/
 * Shared:       crew, schemas, templates, workflows -> .guild/ (paths Mission Control reads)
 * Factory:      with --factory, crew -> .factory/droids/ (fields mapped) and skills -> .factory/skills/
 *
 * Existing files that guild did not write are left alone unless --force is given, so a
 * project's own agents (for example its own playtester) keep working.
 * --check writes nothing and exits 1 when any installed copy differs from guild.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const GUILD = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const flags = new Set(argv.filter((a) => a.startsWith("--")));
const target = argv.find((a) => !a.startsWith("--"));
if (!target) {
  console.error("usage: node scripts/install.mjs <project-dir> [--factory] [--force] [--check]");
  process.exit(2);
}
const PROJECT = resolve(target);
const FORCE = flags.has("--force");
const CHECK = flags.has("--check");
const MARK = "guild-managed";
const version = JSON.parse(readFileSync(join(GUILD, "package.json"), "utf8")).version;

/* Factory tool ids for the Claude Code tool names the crew uses. */
const FACTORY_TOOLS = {
  Read: "Read", Grep: "Grep", Glob: "Glob", LS: "LS",
  Write: "Create", Edit: "Edit", Bash: "Execute",
  WebSearch: "WebSearch", WebFetch: "FetchUrl",
};

const files = (dir) =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : [p];
  });

let drift = 0;
let written = 0;
let skipped = 0;

function place(dest, stamped) {
  if (existsSync(dest)) {
    const current = readFileSync(dest, "utf8");
    if (current === stamped) return;
    const ours = current.includes(MARK);
    if (CHECK) {
      if (ours) {
        drift++;
        console.log(`drift  ${relative(PROJECT, dest)}`);
      }
      return;
    }
    if (!ours && !FORCE) {
      skipped++;
      console.log(`skip   ${relative(PROJECT, dest)} (not guild's; use --force to replace)`);
      return;
    }
  } else if (CHECK) {
    drift++;
    console.log(`missing ${relative(PROJECT, dest)}`);
    return;
  }
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, stamped);
  written++;
}

/* Frontmatter helpers: the crew files use a small, flat YAML header plus a nested guild: block. */
function splitFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  return m ? { head: m[1], body: m[2] } : { head: "", body: text };
}
function field(head, key) {
  const m = head.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return m ? m[1].trim() : undefined;
}
function stampMarkdown(text) {
  const { head, body } = splitFrontmatter(text);
  return `---\n${head}\n---\n<!-- ${MARK} v${version}: edit in guild, then reinstall -->\n${body}`;
}

/* 1. Claude Code and the shared .guild copy. */
for (const f of files(join(GUILD, "crew"))) {
  const text = readFileSync(f, "utf8");
  place(join(PROJECT, ".claude", "agents", relative(join(GUILD, "crew"), f)), stampMarkdown(text));
  place(join(PROJECT, ".guild", "crew", relative(join(GUILD, "crew"), f)), stampMarkdown(text));
}
for (const f of files(join(GUILD, "skills"))) {
  const rel = relative(join(GUILD, "skills"), f);
  const text = readFileSync(f, "utf8");
  place(join(PROJECT, ".claude", "skills", rel), f.endsWith("SKILL.md") ? stampMarkdown(text) : text);
}
for (const dir of ["workflows", "schemas", "templates"]) {
  for (const f of files(join(GUILD, dir))) {
    const rel = relative(join(GUILD, dir), f);
    const text = readFileSync(f, "utf8");
    if (dir === "workflows") place(join(PROJECT, ".claude", "workflows", rel), text);
    place(join(PROJECT, ".guild", dir, rel), text);
  }
}

/* 2. Factory droids and skills. */
if (flags.has("--factory")) {
  for (const f of files(join(GUILD, "crew"))) {
    const { head, body } = splitFrontmatter(readFileSync(f, "utf8"));
    const name = field(head, "name");
    const description = field(head, "description");
    const tools = (field(head, "tools") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => FACTORY_TOOLS[t])
      .filter(Boolean);
    /* Factory has no Fable or alias names; inherit the parent model and keep the intent in a comment. */
    const model = field(head, "model");
    const droid = [
      "---",
      `name: ${name}`,
      `description: ${description}`,
      "model: inherit",
      `tools: ${JSON.stringify([...new Set(tools)])}`,
      "---",
      `<!-- ${MARK} v${version}: generated from guild crew/${name}.md (intended model: ${model}) -->`,
      body,
    ].join("\n");
    place(join(PROJECT, ".factory", "droids", `${name}.md`), droid);
  }
  for (const f of files(join(GUILD, "skills"))) {
    const rel = relative(join(GUILD, "skills"), f);
    const text = readFileSync(f, "utf8");
    place(join(PROJECT, ".factory", "skills", rel), f.endsWith("SKILL.md") ? stampMarkdown(text) : text);
  }
}

if (CHECK) {
  if (drift) {
    console.log(`${drift} guild file(s) out of date; run: node ${relative(process.cwd(), join(GUILD, "scripts", "install.mjs"))} ${target}${flags.has("--factory") ? " --factory" : ""}`);
    process.exit(1);
  }
  console.log("guild install is current");
} else {
  writeFileSync(join(PROJECT, ".guild", "VERSION"), `${version}\n`);
  console.log(`guild v${version}: ${written} written, ${skipped} skipped`);
}
