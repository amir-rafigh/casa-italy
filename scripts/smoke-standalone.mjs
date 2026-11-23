import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const base = process.argv[2];
assert.ok(base, "Pass the URL of a running local standalone server.");
const origin = new URL(base);
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname), "Smoke tests must target a local server.");
let checked = 0;

async function request(url, expected = 200, options) {
  const response = await fetch(new URL(url, origin), options);
  assert.equal(response.status, expected, `${url}: HTTP ${response.status}`);
  checked++;
  return response;
}

for (const route of ["/", "/landing"]) {
  const html = await (await request(route)).text();
  assert.match(html, /<html[^>]*lang="fa"[^>]*dir="rtl"/);
  assert.doesNotMatch(html, /href="\/casaitaly(?:\/|"|#)/);
  assert.doesNotMatch(html, /Create Next App|Menu Demo Platform/);
  assert.match(html, route === "/" ? /MEATBALL/ : /BENVENUTI A CASA/);
  const assets = [...html.matchAll(/(?:href|src)="(\/_next\/[^"<>]+)"/g)].map(match => match[1].replaceAll("&amp;", "&"));
  for (const asset of new Set(assets)) await request(asset);
  for (const link of html.matchAll(/href="(\/[^"<>]*)"/g)) {
    const url = new URL(link[1].replaceAll("&amp;", "&"), origin);
    if (url.pathname.startsWith("/_next/")) continue;
    assert.ok(["/", "/landing"].includes(url.pathname), `Unexpected internal link: ${url.pathname}`);
  }
}

for (const filename of await readdir(path.join(root, "public"), { recursive: true, withFileTypes: true })) {
  if (!filename.isFile()) continue;
  const relative = path.relative(path.join(root, "public"), path.join(filename.parentPath, filename.name)).split(path.sep).map(encodeURIComponent).join("/");
  await request(`/${relative}`, 200, { method: "HEAD" });
  if (filename.name.endsWith(".webp")) await request(`/_next/image?url=${encodeURIComponent(`/${relative}`)}&w=640&q=75`);
}

await request("/brands/pizza/cavasaitaly/landing/casa-kitchen.mp4", 206, { headers: { Range: "bytes=0-1023" } });
for (const route of ["/casaitaly", "/casaitaly/landing", "/baklava", "/ghobadi", "/api/ghobadi"]) await request(route, 404);
console.log(`Standalone smoke test passed: ${checked} HTTP checks (routes, public media, optimized images, chunks, fonts, links, video ranges, and excluded routes).`);
