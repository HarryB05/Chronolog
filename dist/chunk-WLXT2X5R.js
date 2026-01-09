// src/admin/components/Editor.tsx
import { jsx, jsxs } from "react/jsx-runtime";
function Editor({ content, onChange }) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900", children: [
    /* @__PURE__ */ jsx(
      "textarea",
      {
        value: content,
        onChange: (e) => onChange(e.target.value),
        placeholder: "Write your changelog entry here... (Markdown supported)",
        className: "w-full min-h-[400px] resize-y rounded-lg border-0 bg-transparent p-4 font-mono text-sm text-zinc-900 focus:outline-none dark:text-zinc-50"
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "border-t border-zinc-200 p-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400", children: "Tip: Use Markdown syntax (**, *, `, -, 1.) for formatting" })
  ] });
}

export {
  Editor
};
