import type { CustomElementTemplate } from "./custom-element-template.ts";
import { optional, required } from "./types.ts";

export class CustomHTMLModel {
	private _properties: [string, (element: CustomElementTemplate) => any][] = [];
	private _events: [string, string][] = [];

	public getProperties(element: CustomElementTemplate) {
		const out: Record<string, any> = {};

		for (const [key, evaluator] of this._properties) {
			out[key] = evaluator(element);
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
				(element as any)?.[name]?.(event.detail);
			};
		});

		return eventsMap;
	}

	public get observedAttributes() {
		return this._properties.map(([key]) => key);
	}

	constructor(types: Record<string, number>) {
		const properties = Object.keys(types || {});
		for (const name of properties) {
			const lowerName = name.toLowerCase();
			const type = types[name];

			if (
				lowerName.indexOf("on") === 0 &&
				(type === optional.event || type === required.event)
			) {
				this.addEvent(lowerName.slice(2), name);
				continue;
			}

			if (type === optional.string || type === required.string) {
				this.addAttribute(lowerName, "string");
				continue;
			}

			if (type === optional.number || type === required.number) {
				this.addAttribute(lowerName, "number");
				continue;
			}

			if (type === optional.boolean || type === required.boolean) {
				this.addAttribute(lowerName, "boolean", false);
			}
		}
	}

	private addAttribute(
		name: string,
		type: "string" | "number" | "boolean",
		defaultValue?: any,
	) {
		if (type === "string") {
			this._properties.push([
				name,
				(el) =>
					el && (el.hasAttribute(name) ? el.getAttribute(name) : defaultValue),
			]);
			return;
		}

		if (type === "number") {
			this._properties.push([
				name,
				(el) =>
					el &&
					(el.hasAttribute(name)
						? Number(el.getAttribute(name))
						: defaultValue),
			]);
			return;
		}

		if (type === "boolean") {
			this._properties.push([name, (el) => el?.hasAttribute(name)]);
			return;
		}
	}

	private addEvent(name: string, key: string) {
		this._events.push([name, key]);
	}
}
