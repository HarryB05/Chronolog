import {
  Sidebar
} from "./chunk-MRX454HA.js";
import {
  Login
} from "./chunk-7M3BB5WV.js";
import {
  Providers
} from "./chunk-4A7WWWIL.js";
import {
  UserMenu
} from "./chunk-C33QSZGG.js";
import {
  useChronalogSession
} from "./chunk-VPMYIZYL.js";

// src/admin/components/Layout.tsx
import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Github } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function AdminLayout({ children }) {
  return /* @__PURE__ */ jsx(Providers, { children: /* @__PURE__ */ jsx(AdminLayoutContent, { children }) });
}
function AdminLayoutContent({ children }) {
  const { session, status } = useChronalogSession();
  const [homeUrl, setHomeUrl] = useState("/");
  useEffect(() => {
    async function fetchHomeUrl() {
      try {
        const response = await fetch("/api/changelog/settings");
        const data = await response.json();
        if (data.success && data.info?.homeUrl) {
          const url = String(data.info.homeUrl).trim();
          setHomeUrl(url);
        }
      } catch (error) {
        console.error("Failed to fetch home URL:", error);
      }
    }
    fetchHomeUrl();
  }, []);
  if (status === "loading") {
    return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black", children: /* @__PURE__ */ jsx("div", { className: "text-zinc-600 dark:text-zinc-400", children: "Loading..." }) });
  }
  if (status === "unauthenticated") {
    return /* @__PURE__ */ jsx(Login, {});
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col bg-zinc-50 font-sans dark:bg-black", children: [
    /* @__PURE__ */ jsx("div", { className: "sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-black/80", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between px-6 py-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "inline-flex flex-col", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-black dark:text-zinc-50", style: { fontFamily: "'Cormorant', serif" }, children: "Chronalog" }),
        /* @__PURE__ */ jsx(
          "svg",
          {
            className: "h-1 w-full text-black dark:text-zinc-50",
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
      /* @__PURE__ */ jsx("div", { className: "flex items-center gap-3", children: session && /* @__PURE__ */ jsxs(Fragment, { children: [
        (() => {
          const normalizedUrl = String(homeUrl).trim();
          const lowerUrl = normalizedUrl.toLowerCase();
          const isExternal = lowerUrl.startsWith("http://") || lowerUrl.startsWith("https://") || normalizedUrl.startsWith("//");
          if (isExternal) {
            const url = normalizedUrl.startsWith("//") ? `https:${normalizedUrl}` : normalizedUrl;
            return /* @__PURE__ */ jsx(
              "a",
              {
                href: url,
                target: "_blank",
                rel: "noopener noreferrer",
                className: "flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                title: "Go to home",
                children: /* @__PURE__ */ jsx(Home, { className: "h-5 w-5" })
              }
            );
          }
          return /* @__PURE__ */ jsx(
            Link,
            {
              href: normalizedUrl,
              className: "flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
              title: "Go to home",
              children: /* @__PURE__ */ jsx(Home, { className: "h-5 w-5" })
            }
          );
        })(),
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://github.com/harrybarnish/chronalog",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "flex items-center justify-center rounded-lg p-2 text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
            title: "View on GitHub",
            children: /* @__PURE__ */ jsx(Github, { className: "h-5 w-5" })
          }
        ),
        /* @__PURE__ */ jsx(UserMenu, { session })
      ] }) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-1", children: [
      /* @__PURE__ */ jsx(Sidebar, {}),
      /* @__PURE__ */ jsx("div", { className: "flex-1 overflow-auto", children })
    ] }),
    /* @__PURE__ */ jsx("footer", { className: "border-t border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-black", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-center gap-4 text-sm text-zinc-600 dark:text-zinc-400", children: [
      /* @__PURE__ */ jsxs("p", { children: [
        "\xA9 2026 Chronalog. All rights reserved. Built by",
        " ",
        /* @__PURE__ */ jsx(
          "a",
          {
            href: "https://harrybarnish.co.uk",
            target: "_blank",
            rel: "noopener noreferrer",
            className: "underline hover:no-underline",
            children: "Harry Barnish"
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(
        "a",
        {
          href: "https://github.com/harrybarnish/chronalog",
          target: "_blank",
          rel: "noopener noreferrer",
          className: "flex items-center gap-1.5 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
          title: "View on GitHub",
          children: [
            /* @__PURE__ */ jsx(Github, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "GitHub" })
          ]
        }
      )
    ] }) })
  ] });
}

export {
  AdminLayout
};
