const esbuild = require("esbuild");
const path = require("path");

const isWatch = process.argv.includes("--watch");

const buildOptions = {
  entryPoints: ["widget-src/code.tsx"],
  bundle: true,
  outfile: "dist/code.js",
  platform: "browser",
  target: ["es2017"],
  format: "iife",
  globalName: "widget",
  jsxFactory: "widget.h",
  jsxFragment: "widget.Fragment",
  loader: { ".tsx": "tsx", ".ts": "ts" },
  logLevel: "info",
};

if (isWatch) {
  esbuild.context(buildOptions).then((ctx) => {
    ctx.watch();
    console.log("Watching for changes...");
  });
} else {
  esbuild.build(buildOptions).catch(() => process.exit(1));
}