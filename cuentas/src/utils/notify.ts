import Toast from "react-native-toast-message"

/**
 * Cross-platform non-blocking feedback. Replaces `Alert.alert` for
 * success/error/info messages, which is a no-op on react-native-web.
 * For blocking yes/no prompts use `useConfirm` instead.
 */
export const notify = {
  success: (title: string, message?: string) =>
    Toast.show({ type: "success", text1: title, text2: message }),
  error: (title: string, message?: string) =>
    Toast.show({ type: "error", text1: title, text2: message }),
  info: (title: string, message?: string) =>
    Toast.show({ type: "info", text1: title, text2: message }),
}
