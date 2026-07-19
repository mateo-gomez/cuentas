// Platform-specific implementations live in AmountInput.native.tsx (display) and
// AmountInput.web.tsx (focusable input). Metro resolves those by platform; this
// base file is the fallback and the module TypeScript type-checks against.
export { default } from "./AmountInput.native"
export type { AmountInputProps } from "./AmountInput.native"
