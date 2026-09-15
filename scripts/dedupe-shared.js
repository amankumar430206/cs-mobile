// yarn's file: protocol copies ../cs-shared wholesale, including its own node_modules.
// A nested react / @tanstack/react-query / zod would give Metro and tsc a second copy
// (invalid hook calls, a QueryClient context mismatch), so drop it after every install.
const fs = require("fs");
const path = require("path");

const nested = path.join(__dirname, "..", "node_modules", "@castadi", "shared", "node_modules");

if (fs.existsSync(nested)) {
  fs.rmSync(nested, { recursive: true, force: true });
  console.log("dedupe-shared: removed @castadi/shared/node_modules");
}
