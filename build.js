import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import AdmZip from "adm-zip";

const DIST = "dist";
const LIMIT = 13312;

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST);

esbuild.buildSync({
  entryPoints: ["src/js/game.js"],
  outfile: `${DIST}/game.js`,
  bundle: true,
  minify: true,
  legalComments: "none", // 🚀 remove all comments
});

const css = fs.readFileSync("src/css/style.css", "utf8");
fs.writeFileSync(`${DIST}/style.css`, css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\s+/g, " ").trim());

const html = fs.readFileSync("src/index.html", "utf8");
fs.writeFileSync(
  `${DIST}/index.html`,
  html.replace(/<!--[\s\S]*?-->/g, "").replace(/\s+/g, " ").replace(/>\s+</g, "><").trim()
);

const zip = new AdmZip();
function addFolderToZip(srcFolder, zipFolder = "") {
  for (const file of fs.readdirSync(srcFolder)) {
    const fullPath = path.join(srcFolder, file);
    const zipPath = path.join(zipFolder, file);
    if (fs.statSync(fullPath).isDirectory()) {
      addFolderToZip(fullPath, zipPath);
    } else {
      zip.addLocalFile(fullPath, path.dirname(zipPath));
    }
  }
}

addFolderToZip(DIST);
if (fs.existsSync("src/images")) addFolderToZip("src/images", "images");

zip.writeZip("game.zip");

const stats = fs.statSync("game.zip");
const size = stats.size;
const percent = ((size / LIMIT) * 100).toFixed(1);

console.log(`✅ Build complete: game.zip created`);
console.log(`📦 Size: ${size} bytes / ${LIMIT} bytes (${percent}%)`);
if (size > LIMIT) {
  console.warn("⚠️  Over the 13 KB JS13K limit!");
}
