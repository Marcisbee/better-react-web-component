# Better React Web Component

<a href="https://github.com/Marcisbee/better-react-web-component/actions">
  <img alt="CI" src="https://img.shields.io/github/actions/workflow/status/Marcisbee/better-react-web-component/main.yml?branch=main&style=flat-square" />
</a>
<a href="https://www.npmjs.com/package/better-react-web-component">
  <img alt="npm" src="https://img.shields.io/npm/v/better-react-web-component?style=flat-square" />
</a>
<a href="https://bundlephobia.com/result?p=better-react-web-component">
  <img alt="package size" src="https://deno.bundlejs.com/badge?q=better-react-web-component&config={%22esbuild%22:{%22external%22:[%22react%22,%22react-dom%22]}}&badge-style=flat-square" />
</a>

Wrapper for React (v18.x) Component to CustomElement that magically just works and is type safe with Typescript!

- __Small__. About 1kB (minified and gzipped). Zero dependencies.
- __Simple__. Each component interface is defined with strict types.
- Good __TypeScript__ support.

```tsx
import { createCustomElement, InferProps, optional } from 'better-react-web-component'

// Define custom component interface
HelloComponent.types = {
  name: optional.string,
}

// Infer typescript types
type ComponentProps = InferProps<typeof HelloComponent.types>

// Defined component
function HelloComponent({ name = "unknown" }: ComponentProps) {
  return (
    <h1>Hello {name}!</h1>
  )
}

// Create and register custom component
customElements.define(
  "hello-component",
  createCustomElement(HelloComponent, "shadowRoot"),
)
```

Usage in html:

```html
<hello-component name="World" />
```

[Open this demo in StackBlitz](https://stackblitz.com/edit/vitejs-vite-qkz31b?file=src%2Fmain.tsx)

# Install

```sh
npm install better-react-web-component
```

# Guide

## Define attributes
Attributes are defined on component `types` object.

> **Note**
> Attribute names defined here are case-insensitive as they are in HTML spec!
> Hence the below can be used as `<component name="..." />` or `<component nAmE="..." />`.

```ts
MyReactComponent.types = {
  name: optional.string,
  requiredName: required.string,
}
```

### Supported prop types:
- String:
	- `optional.string`
	- `required.string`
- Number:
	- `optional.number`
	- `required.number`
- Boolean:
	- `optional.boolean`
	- `required.boolean`
- Json (parses attribute with JSON.parse):
	- `optional.json`
	- `required.json`
- Function:
	- `optional.event`
	- `required.event`

## Define default values
Default values are defined on react component itself.
```ts
function MyReactComponent({
  requiredName,
  name = "unknown",
}: InferProps<typeof MyReactComponent.types>) {
  ...
}
```

## Handle json/object values
In webcomponent space there is no object type to be passed as value. Instead we can pass json object as string and then parse it in react component. For this we can use `optional.json` or `required.json` (it does parsing automatically so component will receive object not string).

And for Typescript to have proper types we can use `InferProps` feature to replace/update properties like json values.
```ts
MyReactComponent.types = {
  custom: required.json,
}

type Props = InferProps<typeof MyReactComponent.types, {
  custom: {
    foo: string;
    bar: number;
  }
}>
```

Then in component this object can be passed as string
```html
<my-react-component custom='{"foo":"one","bar":2}' />
```

## Handle events
This package also supports custom events to be defined.

> **Note**
> Event names defined here are __CASE-SENSITIVE__ so we lowercase them and remove leading `"on"` to match other event names!

```tsx
import { createCustomElement, InferProps, optional } from 'better-react-web-component'
import { useState } from 'react'

InputName.types = {
  name: optional.string,
  onNameChange: optional.event, // Event name must start with "on" and will be lowercase in html land
}

function InputName({
  name = 'unknown',
  onNameChange,
}: InferProps<typeof InputName.types>) {
  const [localName, setLocalName] = useState(name)

  return (
    <input
      value={localName}
      onChange={(e) => {
        setLocalName(e.target.value)
        onNameChange?.({ detail: e.target.value }) // Trigger custom event here if it's defined
      }}
    />
  )
}

customElements.define('input-name', createCustomElement(InputName))
```

At the same time in html land:

```html
<input-name name="World" />
<script>
  const inputNameEl = document.querySelector('input-name');

  // Note that event name is ALWAYS lowercase without `on` in front of it
  inputNameEl.addEventListener('namechange', (e) => {
    console.log(e.detail);
  });
</script>
```

[Open this demo in StackBlitz](https://stackblitz.com/edit/vitejs-vite-fysuoh?file=src%2Fmain.tsx)
