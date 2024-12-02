// scripts/fix-imports.js
import { readdir, readFile, writeFile } from "fs/promises";
import path from "path";

async function addJsExtension(dir) {
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      await addJsExtension(fullPath);
      continue;
    }

    if (!file.name.endsWith(".js")) continue;

    const content = await readFile(fullPath, "utf8");
    const updatedContent = content.replace(/from ['"](.\/|\.\.\/)(.*?)['"];/g, (match, prefix, importPath) => {
      if (!importPath.endsWith(".js")) {
        return `from '${prefix}${importPath}.js';`;
      }
      return match;
    });

    await writeFile(fullPath, updatedContent);
  }
}

// Start from dist directory
await addJsExtension("./dist");
