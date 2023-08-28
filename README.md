# Better React Web Component
Wrapper for React (v18.x) Component to CustomElement that magically just works and is type safe with Typescript!

- __Small__. About 1.4kB (minified and gzipped). Zero dependencies.
- __Simple__. Each component interface is defined with only using prop-types.
- Good __TypeScript__ support.

```tsx
import { createCustomElement } from 'better-react-web-component'
import PropTypes, { InferProps } from 'prop-types'

// Define custom component interface in prop types
HelloComponent.propTypes = {
  name: PropTypes.string,
}

// Infer typescript types from prop types
type ComponentProps = InferProps<typeof HelloComponent.propTypes>

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
Attributes are defined on component [`propTypes` object](https://github.com/facebook/prop-types).

> **Note**
> Attribute names defined here are case-insensitive as they are in HTML spec!
> Hence the below can be used as `<component name="..." />` or `<component nAmE="..." />`.

```ts
MyReactComponent.propTypes = {
  name: PropTypes.string,
  requiredName: PropTypes.string.isRequired,
}
```

### Supported prop types:
- String:
	- `PropTypes.string`
	- `PropTypes.string.isRequired`
- Number:
	- `PropTypes.number`
	- `PropTypes.number.isRequired`
- Boolean:
	- `PropTypes.bool`
	- `PropTypes.bool.isRequired`
- Function:
	- `PropTypes.func`
	- `PropTypes.func.isRequired`

## Define default values
Default values are defined on react component itself.
```ts
function MyReactComponent({
  requiredName,
  name = "unknown",
}: InferProps<typeof MyReactComponent.propTypes>) {
  ...
}
```

## Handle events
This package also supports custom events to be defined.

> **Note**
> Event names defined here are __CASE-SENSITIVE__ so we lowercase them and remove leading `"on"` to match other event names!

```tsx
import { createCustomElement } from 'better-react-web-component'
import PropTypes, { InferProps } from 'prop-types'
import { useState } from 'react'

InputName.propTypes = {
  name: PropTypes.string,
  onNameChange: PropTypes.func, // Event name must start with "on" and will be lowercase in html land
}

function InputName({
  name = 'unknown',
  onNameChange,
}: InferProps<typeof InputName.propTypes>) {
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
