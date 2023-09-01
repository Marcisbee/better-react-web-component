import type { CustomElementTemplate } from "./custom-element-template.ts";
import { optional, required } from "./types.ts";

export class CustomHTMLModel {
	private _properties: [
		string,
		string,
		(element: CustomElementTemplate) => any,
	][] = [];
	private _events: [string, string][] = [];

	public getProperties(element: CustomElementTemplate) {
		const out: Record<string, any> = {};

		for (const [keyIn, keyOut, evaluator] of this._properties) {
			out[keyOut] = evaluator(element);
		}

		return out;
	}

	public getEvents(element: CustomElementTemplate) {
		const eventsMap: Record<string, (event: CustomEvent) => void> = {};

		const events = this._events;
		events.forEach(([name, key]) => {
			eventsMap[key] = function (event) {
				element.dispatchEvent(
					new CustomEvent(name, { detail: event.detail, bubbles: true }),
				);
			};
		});

		return eventsMap;
	}

	public get observedAttributes() {
		return this._properties.map(([keyIn]) => keyIn);
	}

	constructor(types: Record<string, number>) {
		const properties = Object.keys(types || {});
		for (const originalName of properties) {
			const lowerName = originalName.toLowerCase();
			const type = types[originalName];

			if (
				lowerName.indexOf("on") === 0 &&
				(type === optional.event || type === required.event)
			) {
				this.addEvent(lowerName.slice(2), originalName);
				continue;
			}

			if (type === optional.string || type === required.string) {
				this.addAttribute(lowerName, originalName, "string");
				continue;
			}

			if (type === optional.number || type === required.number) {
				this.addAttribute(lowerName, originalName, "number");
				continue;
			}

			if (type === optional.boolean || type === required.boolean) {
				this.addAttribute(lowerName, originalName, "boolean", false);
			}
		}
	}

	private addAttribute(
		name: string,
		originalName: string,
		type: "string" | "number" | "boolean",
		defaultValue?: any,
	) {
		if (type === "string") {
			this._properties.push([
				name,
				originalName,
				(el) =>
					el && (el.hasAttribute(name) ? el.getAttribute(name) : defaultValue),
			]);
			return;
		}

		if (type === "number") {
			this._properties.push([
				name,
				originalName,
				(el) =>
					el &&
					(el.hasAttribute(name)
						? Number(el.getAttribute(name))
						: defaultValue),
			]);
			return;
		}

		if (type === "boolean") {
			this._properties.push([
				name,
				originalName,
				(el) => el?.hasAttribute(name),
			]);
			return;
		}
	}

	private addEvent(name: string, key: string) {
		this._events.push([name, key]);
	}
}
