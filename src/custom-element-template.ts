import React from "react";
import { type Root, createRoot } from "react-dom/client";

import type { CustomHTMLModel } from "./custom-html-model.ts";

export type ReactComponent = ((props: any) => JSX.Element) & {
	types?: Record<string, number>;
};

export class CustomElementTemplate extends HTMLElement {
	public rootDiv?: HTMLDivElement;
	public rootElement?: HTMLElement | ShadowRoot;
	public __reactRoot?: Root;

	public static domModel: CustomHTMLModel;
	public static ReactComponent: ReactComponent;
	public static renderRoot:
		| "shadowRoot"
		| "shadowRootClosed"
		| "container"
		| "element";

	connectedCallback() {
		this.rootElement = this;
		switch ((this.constructor as typeof CustomElementTemplate).renderRoot) {
			case "container":
				this.rootElement = this.rootDiv = document.createElement("div");
				this.appendChild(this.rootElement);
				break;
			case "shadowRoot":
				this.rootElement = this.attachShadow({ mode: "open" });
				break;
			case "shadowRootClosed":
				this.rootElement = this.attachShadow({ mode: "closed" });
				break;
		}

		this.renderCustomElement();
	}

	renderCustomElement() {
		const ReactComponent = (this.constructor as typeof CustomElementTemplate)
			.ReactComponent;
		const model = (this.constructor as typeof CustomElementTemplate).domModel;
		const properties = model.getProperties(this);
		const events = model.getEvents(this);
		const reactElem = React.createElement(
			ReactComponent,
			Object.assign(properties, events),
		);

		const reactRoot = (this.__reactRoot ??= createRoot(this.rootElement!));
		reactRoot.render(reactElem);
	}

	disconnectedCallback() {
		this.__reactRoot?.unmount();

		if (this.rootDiv) {
			this.removeChild(this.rootDiv);
		}

		this.__reactRoot = undefined;
		this.rootDiv = undefined;
		this.rootElement = undefined;
	}

	attributeChangedCallback(_name: string, oldValue: any, newValue: any) {
		if (oldValue === newValue) {
			return;
		}

		if (!this.rootElement) {
			return;
		}

		this.renderCustomElement();
	}
}
