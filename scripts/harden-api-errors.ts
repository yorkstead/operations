import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const apiRoot = join(process.cwd(), "app", "api");

function filesUnder(directory: string): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? filesUnder(path) : path.endsWith(".ts") ? [path] : [];
  });
}

let changedCount = 0;
for (const file of filesUnder(apiRoot)) {
  let source = readFileSync(file, "utf8");
  const before = source;
  const action = relative(apiRoot, file).replace(/\\/g, "/").replace(/\/route\.ts$/, "").replace(/\//g, ".") || "root";
  source = source.replace(
    /return NextResponse\.json\(\{ error: (?:msg|message) \}, \{ status: 500 \}\);/g,
    `return apiErrorResponse(err, { action: "api.${action}" });`
  );
  if (source !== before && !source.includes('from "@/lib/api-error-response"')) {
    source = `import { apiErrorResponse } from "@/lib/api-error-response";\n${source}`;
  }
  source = source.replace(
    /^(\s*)const (?:msg|message) = err instanceof Error \? err\.message : "[^"]*";\r?\n\1(return apiErrorResponse\(err,[^\r\n]+\);)/gm,
    "$1$2"
  );
  source = source.replace(
    /catch \(err: unknown\) \{\r?\n\s*const (?:msg|message) = err instanceof Error \? err\.message : "[^"]*";\r?\n(?:\s*if \([^\r\n]+\) \{\r?\n\s*return NextResponse\.json\([\s\S]*?\);\r?\n\s*\}\r?\n)*\s*return apiErrorResponse\(err, \{ action: "([^"]+)" \}\);\r?\n\s*\}/g,
    'catch (err: unknown) {\n    return apiErrorResponse(err, { action: "$1" });\n  }'
  );
  if (source === before) continue;
  writeFileSync(file, source);
  changedCount++;
}

console.log(`Hardened ${changedCount} API route files.`);
