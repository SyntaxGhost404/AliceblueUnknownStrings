// Clipboard access for the "User ID" row. React Native no longer ships a clipboard module and
// none is installed, so this copies through the web Clipboard API when it exists (the web
// preview) and is otherwise a quiet no-op. To enable it on devices, add
// `@react-native-clipboard/clipboard` and call `Clipboard.setString(text)` here.
export function copyText(text: string) {
  try {
    (globalThis as any).navigator?.clipboard?.writeText?.(text)?.catch?.(() => {});
  } catch {
    // no clipboard available
  }
}
