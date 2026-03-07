import type { ReactNode } from "react";
import { isTauri } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useFullscreen } from "../hooks/useFullscreen";

interface TauriTitleBarProps {
  children: ReactNode;
}

/**
 * Title bar wrapper that handles macOS Overlay titlebar in Tauri.
 *
 * Uses programmatic startDragging() on mousedown for reliable window
 * dragging in Tauri v2 WebKit. Interactive elements (buttons, inputs)
 * should call e.stopPropagation() on mousedown to prevent drag.
 *
 * In Tauri: renders a drag region with left padding (76px)
 * to clear the traffic lights. In fullscreen, padding is removed.
 *
 * In browser: renders a standard-height bar with normal padding.
 */
export function TauriTitleBar({ children }: TauriTitleBarProps) {
  const isFullscreen = useFullscreen();

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on primary (left) mouse button
    if (e.button !== 0) return;
    // Don't drag when clicking interactive elements
    if (
      e.target instanceof HTMLElement &&
      e.target.closest("button, a, input, select, textarea, [data-no-drag]")
    ) {
      return;
    }
    if (isTauri()) {
      e.preventDefault();
      getCurrentWindow().startDragging();
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className={
        "flex items-center gap-3 px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-panel)] shrink-0 select-none"
      }
      style={isTauri() && !isFullscreen ? { paddingLeft: 76 } : undefined}
    >
      {children}
    </div>
  );
}
