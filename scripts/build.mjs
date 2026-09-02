import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const required = [
  "index.html",
  "styles.css",
  "public/favicon.svg",
  "public/og.png",
  ".nojekyll",
];

execFileSync("python3", [resolve(root, "scripts/make-og.py")], { stdio: "inherit" });

for (const rel of required) {
  const path = resolve(root, rel);
  if (!existsSync(path)) {
    throw new Error(`build missing ${rel}`);
  }
}

const png = readFileSync(resolve(root, "public/og.png"));
if (png[0] !== 0x89 || png[1] !== 0x50) {
  throw new Error("og.png is not a PNG");
}
const width = png.readUInt32BE(16);
const height = png.readUInt32BE(20);
if (width !== 1200 || height !== 630) {
  throw new Error(`og.png must be 1200x630, got ${width}x${height}`);
}

console.log("build ok");
