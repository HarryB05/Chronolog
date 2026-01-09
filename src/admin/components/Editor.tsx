"use client"

// Simple textarea-based editor (fallback if Tiptap is not installed)
// To use Tiptap, install: pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder
// Then uncomment the Tiptap implementation below

interface EditorProps {
  content: string
  onChange: (content: string) => void
}

export function Editor({ content, onChange }: EditorProps) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your changelog entry here... (Markdown supported)"
        className="w-full min-h-[400px] resize-y rounded-lg border-0 bg-transparent p-4 font-mono text-sm text-zinc-900 focus:outline-none dark:text-zinc-50"
      />
      <div className="border-t border-zinc-200 p-2 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        Tip: Use Markdown syntax (**, *, `, -, 1.) for formatting
      </div>
    </div>
  )
}

/* 
// Tiptap implementation (uncomment after installing Tiptap):
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"

export function Editor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Write your changelog entry here...",
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4 dark:prose-invert",
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 border-b border-zinc-200 p-2 dark:border-zinc-800">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive("bold")
              ? "bg-zinc-200 dark:bg-zinc-800"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive("italic")
              ? "bg-zinc-200 dark:bg-zinc-800"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive("code")
              ? "bg-zinc-200 dark:bg-zinc-800"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          &lt;/&gt;
        </button>
        <div className="mx-2 h-4 w-px bg-zinc-300 dark:bg-zinc-700" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive("bulletList")
              ? "bg-zinc-200 dark:bg-zinc-800"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded px-2 py-1 text-sm ${
            editor.isActive("orderedList")
              ? "bg-zinc-200 dark:bg-zinc-800"
              : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
          }`}
        >
          1.
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
*/
