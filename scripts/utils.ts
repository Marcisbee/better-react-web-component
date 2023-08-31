import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function isInRuleset(filePath: string, rules: RegExp[]): boolean {
	for (const rule of rules) {
		if (rule.test(filePath)) {
			return true;
		}
	}

	return false;
}

/**
 * List all files in a directory recursively in a synchronous fashion
 */
function* walkSync(dir: string): IterableIterator<string> {
	const files = readdirSync(dir);

	for (const file of files) {
		const pathToFile = join(dir, file);
		const isDirectory = statSync(pathToFile).isDirectory();
		if (isDirectory) {
			yield* walkSync(pathToFile);
		} else {
			yield pathToFile;
		}
	}
}

const INCLUDE_DEFAULTS = [/\.json$/];
const EXCLUDE_DEFAULTS = [/node_modules\/.*$/];

/**
 * Return files list in matched rules
 */
export function regexGlob(
	dirPath: string,
	options: { include?: RegExp[]; exclude?: RegExp[] } = {},
) {
	const { include = INCLUDE_DEFAULTS, exclude = EXCLUDE_DEFAULTS } = options;
	const paths: string[] = [];

	for (const filePath of walkSync(dirPath)) {
		const excluded = isInRuleset(filePath, exclude);
		const included = isInRuleset(filePath, include);

		if (!excluded && included) {
			paths.push(filePath);
		}
	}

	return paths;
}
