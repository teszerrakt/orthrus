import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { search } from "@codemirror/search";

// Override the hardcoded #282c34 background from oneDark to match our --bg,
// and style the search/replace panel to match the Orthrus dark theme.
const orthrusTheme = EditorView.theme({
  "&": { background: "var(--bg) !important", backgroundColor: "var(--bg) !important" },
  ".cm-scroller": { background: "var(--bg) !important", backgroundColor: "var(--bg) !important" },
  ".cm-gutters": {
    background: "var(--bg-panel) !important",
    backgroundColor: "var(--bg-panel) !important",
    borderRight: "1px solid var(--border)",
  },
  /* ── Search & replace panel ──────────────────────────────────── */
  ".cm-panels": {
    background: "var(--bg-panel)",
    color: "var(--text)",
    borderBottom: "1px solid var(--border)",
  },
  ".cm-panels.cm-panels-top": {
    borderBottom: "1px solid var(--border)",
  },
  ".cm-panels.cm-panels-bottom": {
    borderTop: "1px solid var(--border)",
  },
  ".cm-search": {
    padding: "6px 8px",
    gap: "4px",
    fontSize: "12px",
  },
  ".cm-search label": {
    color: "var(--text-muted)",
    fontSize: "12px",
  },
  ".cm-search input, .cm-search button:not(.cm-button)": {
    background: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    padding: "2px 6px",
    fontSize: "12px",
    outline: "none",
  },
  ".cm-search input:focus": {
    borderColor: "var(--accent)",
  },
  ".cm-search button.cm-button, .cm-button": {
    background: "var(--bg-hover)",
    color: "var(--text-muted)",
    border: "1px solid var(--border)",
    borderRadius: "4px",
    padding: "2px 8px",
    fontSize: "12px",
    cursor: "pointer",
  },
  ".cm-search button.cm-button:hover, .cm-button:hover": {
    background: "var(--border)",
    color: "var(--text)",
  },
  /* Search match highlighting */
  ".cm-searchMatch": {
    background: "rgba(255, 208, 66, 0.15)",
    outline: "1px solid rgba(255, 208, 66, 0.3)",
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    background: "rgba(255, 208, 66, 0.3)",
    outline: "1px solid rgba(255, 208, 66, 0.6)",
  },
  /* Selection match highlighting */
  ".cm-selectionMatch": {
    background: "rgba(88, 166, 255, 0.15)",
  },
  /* Active line (editable mode) */
  ".cm-activeLine": {
    background: "var(--bg-hover)",
  },
  ".cm-activeLineGutter": {
    background: "var(--bg-hover)",
  },
  /* Fold gutter */
  ".cm-foldGutter span": {
    color: "var(--text-dim)",
    fontSize: "12px",
  },
  ".cm-foldGutter span:hover": {
    color: "var(--text)",
  },
});

// Search at the top of the editor, like VS Code
const searchExtension = search({ top: true });

const JSON_EXTENSIONS = [json(), oneDark, orthrusTheme, searchExtension];

interface Props {
  /** The raw value to display/edit */
  value: string;
  /** Whether to auto-pretty-print JSON. Default true. */
  prettyPrint?: boolean;
  /** Read-only display. Default true. */
  readOnly?: boolean;
  /** Called when content changes (editable mode only) */
  onChange?: (value: string) => void;
  /** Fixed height, e.g. "200px". Takes precedence over maxHeight. */
  height?: string;
  /** Max height before scrolling (read-only auto-height). */
  maxHeight?: string;
  /** Show line numbers. Default false for read-only, true for editable. */
  lineNumbers?: boolean;
}

function tryPretty(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export function CodeBlock({
  value,
  prettyPrint = true,
  readOnly = true,
  onChange,
  height,
  maxHeight,
  lineNumbers,
}: Props) {
  const displayValue = prettyPrint ? tryPretty(value) : value;
  const showLineNumbers = lineNumbers ?? !readOnly;

  return (
    <CodeMirror
      value={displayValue}
      extensions={JSON_EXTENSIONS}
      readOnly={readOnly}
      editable={!readOnly}
      onChange={onChange}
      height={height}
      maxHeight={maxHeight}
      basicSetup={{
        lineNumbers: showLineNumbers,
        foldGutter: showLineNumbers,
        highlightActiveLine: !readOnly,
        highlightActiveLineGutter: !readOnly,
        highlightSelectionMatches: true,
        autocompletion: false,
        searchKeymap: true,
        foldKeymap: true,
        bracketMatching: true,
        closeBrackets: !readOnly,
      }}
      style={{ fontSize: "13px" }}
    />
  );
}
