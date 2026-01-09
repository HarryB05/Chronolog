// src/admin/components/Login.tsx
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { jsx, jsxs } from "react/jsx-runtime";
function Login() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [envCheck, setEnvCheck] = useState(null);
  const error = searchParams.get("error");
  useEffect(() => {
    document.title = "Chronalog | Login";
    async function checkEnv() {
      try {
        const response = await fetch("/api/changelog/auth/check-env");
        const data = await response.json();
        setEnvCheck(data);
      } catch (error2) {
        console.error("Failed to check environment:", error2);
      }
    }
    checkEnv();
  }, []);
  const handleLogin = async (e) => {
    e.preventDefault();
    if (envCheck && !envCheck.configured) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch("/api/changelog/auth/login");
      const data = await response.json();
      if (data.url) {
        router.push(data.url);
      }
    } catch (error2) {
      console.error("Login error:", error2);
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md space-y-8 rounded-lg border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex flex-col items-center mb-2", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold text-zinc-900 dark:text-zinc-50", style: { fontFamily: "'Cormorant', serif" }, children: "Chronalog" }),
        /* @__PURE__ */ jsx(
          "svg",
          {
            className: "h-1 w-full text-zinc-900 dark:text-zinc-50",
            viewBox: "0 0 344 22",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            preserveAspectRatio: "none",
            children: /* @__PURE__ */ jsx(
              "path",
              {
                d: "M344.011 11.139C324.301 10.2579 304.597 9.24959 284.894 8.53863C272.845 8.11324 260.782 8.02687 248.73 7.99767C237.653 7.96958 226.572 8.02624 215.492 8.36607C197.524 8.92166 179.533 9.34886 161.609 10.501C113.604 13.5639 65.6405 16.9825 17.6557 20.2303C14.1766 20.4711 10.5032 21.2128 7.27299 20.3748C4.85051 19.7428 1.96342 17.3206 1.13349 15.0471C-0.155782 11.5074 2.6377 9.93367 6.19942 9.76733C26.4516 8.77596 46.7082 7.68574 66.9734 6.72326C104.761 4.91632 142.54 2.99569 180.343 1.48669C197.055 0.818321 213.828 0.704748 230.554 1.01367C236.21 1.12498 241.865 1.26455 247.537 1.34824C252.406 1.42438 257.382 3.27464 262.083 2.64962C269.089 1.71725 275.703 4.78722 282.333 3.95123C291.24 2.83485 299.622 5.43188 308.276 5.8046C317.374 6.18302 326.484 6.6186 335.569 7.30781C338.525 7.53905 341.414 8.63074 344.335 9.34165C344.237 9.93177 344.138 10.536 344.039 11.1403L344.011 11.139Z",
                fill: "currentColor"
              }
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-zinc-600 dark:text-zinc-400", children: "Sign in with GitHub to access your changelog dashboard" })
    ] }),
    envCheck && !envCheck.configured && /* @__PURE__ */ jsx("div", { className: "rounded-md border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", children: [
      /* @__PURE__ */ jsx(AlertCircle, { className: "h-5 w-5 shrink-0 text-yellow-600 dark:text-yellow-400" }),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("h3", { className: "mb-1 text-sm font-semibold text-yellow-800 dark:text-yellow-200", children: "GitHub OAuth not configured" }),
        /* @__PURE__ */ jsx("p", { className: "mb-2 text-sm text-yellow-700 dark:text-yellow-300", children: "The following environment variables are missing:" }),
        /* @__PURE__ */ jsx("ul", { className: "mb-3 list-inside list-disc space-y-1 text-sm text-yellow-700 dark:text-yellow-300", children: envCheck.missing?.map((varName) => /* @__PURE__ */ jsx("li", { className: "font-mono", children: varName }, varName)) }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-yellow-600 dark:text-yellow-400", children: [
          "Please add these to your ",
          /* @__PURE__ */ jsx("code", { className: "rounded bg-yellow-100 px-1 py-0.5 font-mono text-xs dark:bg-yellow-900/30", children: ".env.local" }),
          " file and restart your development server."
        ] })
      ] })
    ] }) }),
    error && /* @__PURE__ */ jsx("div", { className: "rounded-md bg-red-50 p-4 dark:bg-red-900/20", children: /* @__PURE__ */ jsx("p", { className: "text-sm text-red-800 dark:text-red-200", children: error === "access_denied" ? "Access denied. You must have access to this repository to log in." : "An error occurred during login. Please try again." }) }),
    /* @__PURE__ */ jsxs(
      Link,
      {
        href: "/api/changelog/auth/login",
        onClick: handleLogin,
        className: `flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-100 ${isLoading ? "animate-pulse" : ""} ${envCheck && !envCheck.configured ? "opacity-50 cursor-not-allowed" : ""}`,
        onClick: (e) => {
          if (envCheck && !envCheck.configured) {
            e.preventDefault();
          } else {
            handleLogin(e);
          }
        },
        children: [
          /* @__PURE__ */ jsx(
            "svg",
            {
              className: "mr-2 h-4 w-4",
              "aria-hidden": "true",
              focusable: "false",
              "data-prefix": "fab",
              "data-icon": "github",
              role: "img",
              xmlns: "http://www.w3.org/2000/svg",
              viewBox: "0 0 496 512",
              children: /* @__PURE__ */ jsx(
                "path",
                {
                  fill: "currentColor",
                  d: "M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
                }
              )
            }
          ),
          isLoading ? "Signing in..." : "Sign in with GitHub"
        ]
      }
    )
  ] }) });
}

export {
  Login
};
