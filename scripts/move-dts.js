import { renameSync, existsSync, mkdirSync } from "fs";

// Move declaration files to correct locations
if (existsSync("dist/page.d.ts")) {
  renameSync("dist/page.d.ts", "dist/admin/page.d.ts");
}

if (existsSync("dist/media.d.ts")) {
  renameSync("dist/media.d.ts", "dist/admin/media.d.ts");
}

if (existsSync("dist/settings.d.ts")) {
  renameSync("dist/settings.d.ts", "dist/admin/settings.d.ts");
}

if (existsSync("dist/components/Editor.d.ts")) {
  if (!existsSync("dist/admin/components")) {
    mkdirSync("dist/admin/components", { recursive: true });
  }
  renameSync("dist/components/Editor.d.ts", "dist/admin/components/Editor.d.ts");
}