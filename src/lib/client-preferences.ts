"use client";

import { useSyncExternalStore } from "react";

const preferenceEvent = "omnibrain-preferences-change";
function subscribe(callback: () => void) {
  window.addEventListener(preferenceEvent, callback);
  window.addEventListener("storage", callback);
  return () => { window.removeEventListener(preferenceEvent, callback); window.removeEventListener("storage", callback); };
}
export function useWorkspacePreference(key: string) {
  return useSyncExternalStore(subscribe, () => {
    try { return localStorage.getItem(key) === "true"; } catch { return false; }
  }, () => false);
}
export function saveWorkspacePreference(key: string, value: boolean) {
  try {
    localStorage.setItem(key, String(value));
    window.dispatchEvent(new Event(preferenceEvent));
  } catch { /* Browser storage is optional. */ }
}
