import { defineConfig } from "tsup"

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      client: "src/client.ts",
      "cli/init": "cli/init.ts"
    },
    format: ["esm"],
    dts: true,
    clean: true,
    external: ["jose", "next/headers"],
  },
  {
    entry: {
      "admin/page": "src/admin/page.tsx",
      "admin/media": "src/admin/media.tsx",
      "admin/components/Editor": "src/admin/components/Editor.tsx",
      "admin/components/Sidebar": "src/admin/components/Sidebar.tsx",
      "admin/components/Layout": "src/admin/components/Layout.tsx",
      "admin/components/Login": "src/admin/components/Login.tsx",
      "admin/components/Providers": "src/admin/components/Providers.tsx",
      "admin/components/UserMenu": "src/admin/components/UserMenu.tsx",
      "admin/settings": "src/admin/settings.tsx",
      "utils/auth/hooks": "src/utils/auth/hooks.tsx"
    },
    format: ["esm"],
    dts: false, // Skip DTS for admin components (client-side React components)
    clean: false,
    external: ["react", "react-dom", "next", "next/link", "next/navigation", "lucide-react", "@tanstack/react-query"],
  }
])