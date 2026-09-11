import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const dir = dirname(fileURLToPath(import.meta.url));
const codePath = join(dir, "code.js");
const refPath = join(dir, "ref-clones.js");

const codeLines = readFileSync(codePath, "utf8").split("\n");
const refLines = readFileSync(refPath, "utf8").split("\n");

const codeStart = codeLines.findIndex((l) => l.startsWith("function createRefCloneBuilders(ctx)"));
const refStart = refLines.findIndex((l) => l.startsWith("function createRefCloneBuilders(ctx)"));

if (codeStart < 0 || refStart < 0) {
  console.error("createRefCloneBuilders not found");
  process.exit(1);
}

// Find closing brace of top-level function (line starts with "}" only, after return block)
function findFnEnd(lines, start) {
  for (let i = lines.length - 1; i >= start; i--) {
    if (lines[i] === "}") return i;
  }
  throw new Error("function end not found");
}

const codeEnd = findFnEnd(codeLines, codeStart);
const refEnd = findFnEnd(refLines, refStart);

const merged = [
  ...codeLines.slice(0, codeStart),
  ...refLines.slice(refStart, refEnd + 1),
  ...codeLines.slice(codeEnd + 1),
];

writeFileSync(codePath, merged.join("\n"));
console.log(
  `Synced ref-clones.js (${refEnd - refStart + 1} lines) into code.js (replaced ${codeEnd - codeStart + 1} lines)`
);
