import { claro } from "../theme/palettes/claro"

const grafito = claro.palette

// react-native-web doesn't render a focus ring on Touchables by default, which
// fails WCAG 2.4.7 for keyboard users. Inject a global :focus-visible outline.
let injected = false

export const injectA11yStyles = () => {
  if (injected || typeof document === "undefined") return
  injected = true

  const style = document.createElement("style")
  style.textContent = `
    [role="button"]:focus-visible,
    a:focus-visible,
    input:focus-visible,
    textarea:focus-visible,
    [tabindex]:focus-visible {
      outline: 2px solid ${grafito.accent};
      outline-offset: 2px;
      border-radius: 6px;
    }
    /* Date field: input is invisible, so ring the wrapper instead. */
    [data-a11y-field="date"]:focus-within {
      outline: 2px solid ${grafito.accent};
      outline-offset: 2px;
      border-radius: 8px;
    }
    /* Account rows: inset ring so it never clips against the sheet edges, and
       :focus (not :focus-visible) so it also shows on programmatic focus. */
    [data-a11y-account]:focus {
      outline: 2px solid ${grafito.accent};
      outline-offset: -2px;
      border-radius: 12px;
    }
  `
  document.head.appendChild(style)
}
