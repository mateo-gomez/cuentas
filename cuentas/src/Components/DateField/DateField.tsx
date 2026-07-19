// Platform-specific implementations live in DateField.native.tsx and
// DateField.web.tsx. Metro resolves those by platform; this base file is the
// fallback and the module TypeScript type-checks against.
export { default } from "./DateField.native"
export type { DateFieldProps } from "./DateField.native"
