// Platform-specific implementations live in Shell.native.tsx (passthrough)
// and Shell.web.tsx (centered app column on a ledger backdrop). Metro resolves
// the right one per platform.
export { default } from "./Shell.native"
