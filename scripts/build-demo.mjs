import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const siteDir = join(root, "site");
const docsDir = join(root, "docs");
const distDir = join(root, "dist");

if (!existsSync(distDir)) {
  throw new Error("dist klasörü bulunamadı. Önce `yarn build` çalıştırılmalı.");
}

rmSync(siteDir, { recursive: true, force: true });
mkdirSync(siteDir, { recursive: true });

cpSync(docsDir, siteDir, { recursive: true });
cpSync(distDir, join(siteDir, "dist"), { recursive: true });

console.log("Demo çıktısı hazırlandı: site/");
