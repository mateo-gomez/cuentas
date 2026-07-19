// Platform-specific implementations live in openDatePicker.native.ts (Android
// picker) and openDatePicker.web.ts (browser date input). Metro resolves those
// by platform; this base file is the fallback TypeScript type-checks against.
export { openDatePicker } from "./openDatePicker.native"
export type { OpenDatePickerArgs } from "./openDatePicker.native"
