import process from "node:process";
import { pipeline } from "node:stream/promises";
import { run } from "node:test";
import { spec as SpecReporter } from "node:test/reporters";

import { regexGlob } from "./utils";

let fail = false;

const source = run({
	concurrency: true,
	files: regexGlob("src", { include: [/\.test\.ts$/] }),
}).once("test:fail", () => {
	fail = true;
});

const reporter = new SpecReporter();
const destination = process.stdout;

await pipeline(source, reporter, destination);

if (fail) throw new Error("Tests failed");
