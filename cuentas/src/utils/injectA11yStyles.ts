// Platform-specific implementations live in injectA11yStyles.native.ts (no-op)
// and injectA11yStyles.web.ts (focus-ring CSS). Metro resolves those by platform.
export { injectA11yStyles } from "./injectA11yStyles.native"
