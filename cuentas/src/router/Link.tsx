// Platform-specific implementations live in Link.native.tsx and Link.web.tsx.
// Metro resolves those by platform; this base file is the fallback and the
// module TypeScript type-checks against.
export { default } from "./Link.native"
export type { AppLinkProps } from "./Link.native"
