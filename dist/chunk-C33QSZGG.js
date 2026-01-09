import {
  useChronalogSignOut
} from "./chunk-VPMYIZYL.js";

// src/admin/components/UserMenu.tsx
import { useState, useEffect, useRef } from "react";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function UserMenu({ session }) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const menuRef = useRef(null);
  const { signOut } = useChronalogSignOut();
  useEffect(() => {
    const stored = localStorage.getItem("chronalog-theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialTheme = stored || (systemPrefersDark ? "dark" : "light");
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);
  const applyTheme = (newTheme) => {
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("chronalog-theme", newTheme);
  };
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    applyTheme(newTheme);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  return /* @__PURE__ */ jsxs("div", { className: "relative", ref: menuRef, children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setIsOpen(!isOpen),
        className: "flex items-center justify-center rounded-full transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 dark:focus:ring-zinc-400",
        children: session.user.image ? /* @__PURE__ */ jsx(
          "img",
          {
            src: session.user.image,
            alt: session.user.name || session.user.login,
            className: "h-8 w-8 rounded-full border-2 border-zinc-200 dark:border-zinc-700"
          }
        ) : /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700", children: /* @__PURE__ */ jsx(User, { className: "h-4 w-4 text-zinc-600 dark:text-zinc-400" }) })
      }
    ),
    isOpen && /* @__PURE__ */ jsx("div", { className: "absolute right-0 mt-2 w-56 rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900", children: /* @__PURE__ */ jsxs("div", { className: "p-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "px-3 py-2", children: [
        /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-zinc-900 dark:text-zinc-50", children: session.user.name || session.user.login }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-zinc-500 dark:text-zinc-400", children: session.user.email })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "my-1 h-px bg-zinc-200 dark:bg-zinc-800" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: toggleTheme,
          className: "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
          children: theme === "light" ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Moon, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Dark mode" })
          ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Sun, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Light mode" })
          ] })
        }
      ),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: signOut,
          className: "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800",
          children: [
            /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
            /* @__PURE__ */ jsx("span", { children: "Sign out" })
          ]
        }
      )
    ] }) })
  ] });
}

export {
  UserMenu
};
