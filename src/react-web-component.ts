import PropTypes, { type Validator } from "prop-types";
import React from "react";
import ReactDOM from "react-dom/client";

interface ExportableProperty {
	name: string;
	key: string;
	fromDOM: (element: HTMLElement) => any;
}

type ReactComponent = ((props: any) => JSX.Element) & {
	propTypes: Record<string, Validator<any>>;
};

class DOMModel {
	private _events: { name: string; key: string }[] = [];
	private _attributeKeys: Record<string, string> = {};
	private _observers: MutationObserver[] | null = [];
	private _attributes: string[] | null = [];
	private _exportableProperties?: ExportableProperty[] | null;

	public makeAttribute(
		name: string,
		key: string,
		type: "string" | "boolean" = "string",
		defaultValue?: any,
	) {
		const normalName = name.toLowerCase();
		this.addAttribute(normalName);
		this.addAttributeKey(normalName, key);

		if (type === "string") {
			this.addProperty(normalName, key, (element) => {
				return (
					element &&
					(element.hasAttribute(normalName)
						? element.getAttribute(normalName)
						: defaultValue)
				);
			});
		}

		if (type === "boolean") {
			this.addProperty(normalName, key, (element) => {
				return element?.hasAttribute(normalName);
			});
		}
	}

	/**
	 * Registers this property on the model
	 *
	 * @param {String} name - the name of the property
	 * @param {String} key
	 * @param {function} fromDOM - the method to convert from DOM to Model
	 */
	public addProperty(
		name: string,
		key: string,
		fromDOM: ExportableProperty["fromDOM"],
	) {
		if (!this._exportableProperties) {
			this._exportableProperties = [];
		}
		this._exportableProperties.push({
			name,
			key,
			fromDOM,
		});
	}

	/**
	 * Returns a property based on the name
	 *
	 * @param name - the name fo the property we are looking from
	 * @returns the registered property
	 */
	public getProperty(name: string) {
		const normalName = name.toLowerCase();
		return this._exportableProperties?.find(
			(exportableProperty) => exportableProperty.name === normalName,
		);
	}

	/**
	 * Registers an attribute
	 *
	 * @param attrName - the attribute name
	 */
	addAttribute(attrName: string) {
		if (!this._attributes) {
			this._attributes = [];
		}

		this._attributes.push(attrName);
	}

	/**
	 * Adds a attribute key
	 *
	 * @param attrName - the name of the attribute
	 * @param key - the key
	 */
	addAttributeKey(attrName: string, key: string) {
		this._attributeKeys[attrName] = key;
	}

	/**
	 * Gets the key of an attribute
	 *
	 * @param attrName - the attribute name to look for
	 * @returns - the key of the attribute
	 */
	getAttributeKey(attrName: string): string {
		return this._attributeKeys[attrName];
	}

	/**
	 * Register an event to the model
	 *
	 * @param name - the event name
	 * @param key - the event key
	 */
	addEvent(name: string, key: string) {
		if (!this._events) {
			this._events = [];
		}

		this._events.push({ name, key });
	}

	/**
	 * Registers an observer on the Model
	 *
	 * @param observer - the mutation observer
	 */
	addObserver(observer: MutationObserver) {
		if (!this._observers) {
			this._observers = [];
		}

		this._observers.push(observer);
	}

	/**
	 * Returns the registered attributes on the model
	 *
	 * @returns the registered attributes
	 */
	get attributes(): Array<string> {
		return this._attributes || [];
	}

	/**
	 * Returns the registered events on the model
	 *
	 * @returns the registered events
	 */
	get events(): DOMModel["_events"] {
		return this._events || [];
	}

	/**
	 * Generates the model from a DOM element
	 *
	 * @param element - the element to parse the model from
	 */
	fromDOM(element: HTMLElement) {
		if (!this._exportableProperties) {
			return;
		}

		this._exportableProperties.forEach((exportableProperty) => {
			const result = exportableProperty.fromDOM(element);
			(this as any)[exportableProperty.name] = result;
		});
	}

	/**
	 * Returns the registered properties on the model
	 *
	 * @returns the registered properties
	 */
	get properties() {
		if (!this._exportableProperties) {
			return {};
		}

		const wrappedProperties: Record<string, any> = {
			allowPublishProduct: true,
		};
		this._exportableProperties.forEach((property) => {
			wrappedProperties[property.key] = (this as any)[property.name];
		});
		return wrappedProperties;
	}

	/**
	 * Destroys the model
	 */
	destroy() {
		if (this._observers) {
			this._observers.forEach((observer) => {
				observer.disconnect();
			});
		}
		this._observers = null;
		this._attributes = null;
		this._exportableProperties = null;
	}
}

const _rootShadows = new WeakMap();
const _models = new WeakMap<CustomElement, DOMModel>();

/**
 * Generates the model for a given CustomElement
 *
 * @param component - the component to parse
 * @returns the generated model
 */
function generateModel(component: CustomElement): DOMModel {
	let model = _models.get(component)!;
	if (!model && (component.constructor as typeof CustomElement).domModel) {
		model = new (component.constructor as typeof CustomElement).domModel();
		model.fromDOM(component);
		_models.set(component, model);
	}
	return model;
}

/**
 * Generates the events for a CustomElement
 *
 * @param component - the component to parse the model fromDO
 * @returns the events object
 */
function getEvents(component: CustomElement): object {
	const eventsMap: Record<string, (event: CustomEvent) => void> = {};
	const model = _models.get(component);

	if (model) {
		const events = model.events;
		events.forEach(({ name, key }) => {
			eventsMap[key] = function (event) {
				component.dispatchEvent(
					new CustomEvent(name, { detail: event.detail, bubbles: true }),
				);
			};
		});
	}

	return eventsMap;
}

/**
 * Renders a CustomElement
 *
 * @param component - the component to render
 */
function renderCustomElement(component: CustomElement) {
	const ReactComponent = (component.constructor as typeof CustomElement)
		.ReactComponent;
	const model = generateModel(component);
	const properties = model.properties!;
	const events = getEvents(component);
	const reactElem = React.createElement(
		ReactComponent,
		Object.assign(properties, events),
		null,
	);
	const reactRoot = ReactDOM.createRoot(_rootShadows.get(component));
	component.__reactComp = reactRoot;

	reactRoot.render(reactElem);
}

export class CustomElement extends HTMLElement {
	public rootDiv?: HTMLDivElement;

	public static domModel: typeof DOMModel;
	public static ReactComponent: ReactComponent;
	public static renderRoot: "shadowRoot" | "container" | "element";

	public __reactComp?: ReactDOM.Root;

	connectedCallback() {
		let rootEl: HTMLElement | ShadowRoot = this;
		switch ((this.constructor as typeof CustomElement).renderRoot) {
			case "container":
				rootEl = this.rootDiv = document.createElement("div");
				this.appendChild(rootEl);
				break;
			case "shadowRoot":
				rootEl = this.attachShadow({ mode: "closed" });
				break;
		}
		_rootShadows.set(this, rootEl);

		renderCustomElement(this);
	}

	_generateModel() {
		return generateModel(this);
	}

	disconnectedCallback() {
		const rootEl = _rootShadows.get(this);
		if (rootEl) {
			this.__reactComp?.unmount();
		}

		if (this.rootDiv) {
			this.removeChild(this.rootDiv);
			this.rootDiv = undefined;
		}

		const model = _models.get(this);
		if (model) {
			model.destroy();
			_models.delete(this);
		}
	}

	attributeChangedCallback(name: string, _oldValue: any, newValue: any) {
		const model = _models.get(this);
		if (model) {
			const key = model.getAttributeKey(name);
			const property = model.getProperty(key);
			(model as any)[key] = property ? property.fromDOM(this) : newValue;
			renderCustomElement(this);
		}
	}
}

/**
 * Creates a CustomElement
 * @param ReactComponent
 * @param renderRoot
 */
export function createCustomElement(
	ReactComponent: ReactComponent,
	renderRoot: "shadowRoot" | "container" | "element" = "element",
) {
	class Model extends DOMModel {
		// rome-ignore lint/correctness/noUnreachableSuper: <Error makes no sense, possibly bug in ROME>
		constructor() {
			super();

			const properties = Object.keys(ReactComponent.propTypes);
			for (const name of properties) {
				const lowerName = name.toLowerCase();
				const type = ReactComponent.propTypes[name];

				if (
					lowerName.indexOf("on") === 0 &&
					(type === PropTypes.func || type === PropTypes.func.isRequired)
				) {
					this.addEvent(lowerName.slice(2), name);
					continue;
				}

				if (type === PropTypes.string || type === PropTypes.string.isRequired) {
					this.makeAttribute(lowerName, name);
					continue;
				}

				if (type === PropTypes.bool || type === PropTypes.bool.isRequired) {
					this.makeAttribute(lowerName, name, "boolean", false);
				}
			}
		}
	}

	class CustomCustomElement extends CustomElement {}

	CustomCustomElement.domModel = Model;
	CustomCustomElement.ReactComponent = ReactComponent;
	CustomCustomElement.renderRoot = renderRoot;

	return CustomCustomElement;
}
