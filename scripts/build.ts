import * as esbuild from "esbuild";

for (const format of ["cjs", "esm"] as const) {
	await esbuild
		.build({
			entryPoints: ["./src/index.ts"],
			bundle: true,
			outdir: "dist",
			outExtension: {
				".js": format === "esm" ? ".mjs" : ".js",
			},
			minify: true,
			sourcemap: "linked",
			treeShaking: true,
			target: "es2016",
			format,
			external: ["react", "react-dom"],
			platform: "browser",
			logLevel: "info",
		})
		.catch(() => process.exit(1));
}
