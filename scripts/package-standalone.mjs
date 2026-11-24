import { access, cp, readdir, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const standalone = path.join(root, ".next", "standalone");
await access(path.join(standalone, "server.js"));
await cp(path.join(root, "public"), path.join(standalone, "public"), { recursive: true });
await cp(path.join(root, ".next", "static"), path.join(standalone, ".next", "static"), { recursive: true });
// Next may trace dotenv files. The deployable artifact must never contain them.
for (const name of await readdir(standalone)) {
  if (name === '.env' || name.startsWith('.env.')) await unlink(path.join(standalone,name));
}
await import('./package-ops.mjs');

console.log("Standalone public assets and Next.js static files packaged.");
