export type HapticPattern = number | number[];

export function vibrate(pattern?: HapticPattern): boolean {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") {
    return false;
  }
  try {
    return navigator.vibrate(pattern ?? 8);
  } catch {
    return false;
  }
}
