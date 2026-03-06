/**
 * Fullscreen Detection Hook
 *
 * Detects when the Tauri window is in fullscreen mode.
 * Used to adjust UI (e.g., remove traffic light padding).
 * Delays state changes to allow macOS fullscreen animation to finish.
 * Returns false in non-Tauri (browser) environments.
 *
 * @module src/hooks/useFullscreen
 */

import { useEffect, useState } from "react";
import { isTauri } from "@tauri-apps/api/core";

const IS_TAURI = isTauri();
const ANIMATION_DELAY_MS = 500;

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!IS_TAURI) return;

    let cancelled = false;
    let delayTimer: ReturnType<typeof setTimeout> | undefined;

    function update(value: boolean) {
      clearTimeout(delayTimer);
      if (value) {
        // Entering fullscreen: delay to let macOS animation finish
        delayTimer = setTimeout(() => {
          if (!cancelled) setIsFullscreen(true);
        }, ANIMATION_DELAY_MS);
      } else {
        // Exiting fullscreen: immediate
        if (!cancelled) setIsFullscreen(false);
      }
    }

    async function setup() {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const appWindow = getCurrentWindow();

      // Check initial state (no delay needed)
      const initial = await appWindow.isFullscreen();
      if (!cancelled) setIsFullscreen(initial);

      // Listen for resize events (fullscreen triggers resize)
      const unlisten = await appWindow.onResized(() => {
        appWindow.isFullscreen().then((fs) => {
          if (!cancelled) update(fs);
        });
      });

      return unlisten;
    }

    let unlisten: (() => void) | undefined;
    setup().then((fn) => {
      if (cancelled) {
        fn?.();
      } else {
        unlisten = fn;
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(delayTimer);
      unlisten?.();
    };
  }, []);

  return isFullscreen;
}
