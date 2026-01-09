// src/admin/components/Providers.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { jsx } from "react/jsx-runtime";
function Providers({ children }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1e3
          // 1 minute
        }
      }
    })
  );
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children });
}

export {
  Providers
};
