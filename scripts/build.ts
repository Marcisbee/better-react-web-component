import * as esbuild from "esbuild";

await esbuild
	.build({
		entryPoints: ["./src/react-web-component.ts"],
		bundle: true,
		outdir: "dist",
		outExtension: {
			".js": ".mjs",
		},
		minify: true,
		sourcemap: "linked",
		treeShaking: true,
		target: "es2016",
		format: "esm",
		external: ["react", "react-dom", "prop-types"],
		platform: "browser",
		logLevel: "info",
	})
	.catch(() => process.exit(1));
