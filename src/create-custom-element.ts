import {
	CustomElementTemplate,
	type ReactComponent,
} from "./custom-element-template.ts";
import { CustomHTMLModel } from "./custom-html-model.ts";

/**
 * Creates a CustomElement
 * @param ReactComponent ReactComponent with propTypes
 * @param renderRoot
 * - "container" appends to generated <div> element
 * - "shadowRoot" renders to shadow root
 * - "element" renders directly
 * @param bindValue
 */
export function createCustomElement(
	ReactComponent: ReactComponent,
	renderRoot: "shadowRoot" | "container" | "element" = "element",
	bindValue?: Record<string, any>,
) {
	const BoundReactComponent = bindValue
		? ReactComponent.bind(bindValue)
		: ReactComponent;
	BoundReactComponent.types = ReactComponent.types;

	class FinalCustomElement extends CustomElementTemplate {
		static override domModel = new CustomHTMLModel(
			BoundReactComponent.types || {},
		);
		static override ReactComponent = BoundReactComponent;
		static override renderRoot = renderRoot;

		static observedAttributes = FinalCustomElement.domModel.observedAttributes;
	}

	return FinalCustomElement;
}
