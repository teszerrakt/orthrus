/**
 * Manual maximize state tracker for Tauri on macOS.
 *
 * macOS has no true "maximize" — it uses "zoom" via NSWindow.isZoomed().
 * Tauri's toggleMaximize() calls is_maximized() internally, which is
 * unreliable on macOS overlay title bars (returns stale values due to
 * styleMask mutations). See tauri-apps/tauri#5812.
 *
 * This hook tracks the state locally in JS and exposes an explicit
 * toggle function using maximize()/unmaximize() instead.
 */

import { useCallback, useRef } from "react";

export function useMaximizeToggle() {
  const maximized = useRef(false);

  const toggle = useCallback(async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();

    if (maximized.current) {
      await win.unmaximize();
      maximized.current = false;
    } else {
      await win.maximize();
      maximized.current = true;
    }
  }, []);

  return toggle;
}
