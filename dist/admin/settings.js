"use client";
import {
  AdminLayout
} from "../chunk-JZ76GNYZ.js";
import "../chunk-MRX454HA.js";
import "../chunk-7M3BB5WV.js";
import "../chunk-4A7WWWIL.js";
import "../chunk-C33QSZGG.js";
import "../chunk-VPMYIZYL.js";

// src/admin/settings.tsx
import { useState, useEffect } from "react";
import { GitBranch, CheckCircle2, X } from "lucide-react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function SettingsPage() {
  const [repoInfo, setRepoInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predefinedTags, setPredefinedTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [savingTags, setSavingTags] = useState(false);
  const [tagsStatus, setTagsStatus] = useState({ type: null, message: "" });
  const [homeUrl, setHomeUrl] = useState("/");
  const [savingHomeUrl, setSavingHomeUrl] = useState(false);
  const [homeUrlStatus, setHomeUrlStatus] = useState({ type: null, message: "" });
  useEffect(() => {
    async function fetchRepoInfo() {
      try {
        const response = await fetch("/api/changelog/settings");
        const data = await response.json();
        if (data.success) {
          setRepoInfo(data.info);
        }
      } catch (error) {
        console.error("Failed to fetch repository info:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchRepoInfo();
  }, []);
  useEffect(() => {
    async function fetchTags() {
      try {
        const response = await fetch("/api/changelog/tags");
        const data = await response.json();
        if (data.success) {
          setPredefinedTags(data.tags || []);
        }
      } catch (error) {
        console.error("Failed to fetch predefined tags:", error);
      }
    }
    fetchTags();
  }, []);
  useEffect(() => {
    async function fetchHomeUrl() {
      try {
        const response = await fetch("/api/changelog/home-url");
        const data = await response.json();
        if (data.success && data.homeUrl) {
          setHomeUrl(data.homeUrl);
        }
      } catch (error) {
        console.error("Failed to fetch home URL:", error);
      }
    }
    fetchHomeUrl();
  }, []);
  useEffect(() => {
    if (tagsStatus.type === "success") {
      const timer = setTimeout(() => {
        setTagsStatus({ type: null, message: "" });
      }, 3e3);
      return () => clearTimeout(timer);
    }
  }, [tagsStatus.type]);
  useEffect(() => {
    if (homeUrlStatus.type === "success") {
      const timer = setTimeout(() => {
        setHomeUrlStatus({ type: null, message: "" });
      }, 3e3);
      return () => clearTimeout(timer);
    }
  }, [homeUrlStatus.type]);
  const handleAddTag = async () => {
    const trimmedTag = newTag.trim().toLowerCase();
    if (trimmedTag && !predefinedTags.includes(trimmedTag)) {
      const updatedTags = [...predefinedTags, trimmedTag].sort();
      setPredefinedTags(updatedTags);
      setNewTag("");
      setSavingTags(true);
      setTagsStatus({ type: null, message: "" });
      try {
        const response = await fetch("/api/changelog/tags", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ tags: updatedTags })
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
        }
        if (!data.success) {
          throw new Error(data.error || "Failed to save tag");
        }
      } catch (error) {
        console.error("[Settings] Error saving tag:", error);
        setTagsStatus({
          type: "error",
          message: error instanceof Error ? error.message : "Failed to save tag"
        });
        setPredefinedTags(predefinedTags);
      } finally {
        setSavingTags(false);
      }
    }
  };
  const handleRemoveTag = async (tagToRemove) => {
    const updatedTags = predefinedTags.filter((tag) => tag !== tagToRemove);
    setPredefinedTags(updatedTags);
    setSavingTags(true);
    setTagsStatus({ type: null, message: "" });
    try {
      const response = await fetch("/api/changelog/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tags: updatedTags })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      if (!data.success) {
        throw new Error(data.error || "Failed to save tags");
      }
    } catch (error) {
      console.error("[Settings] Error saving tags:", error);
      setTagsStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save tags"
      });
      setPredefinedTags(predefinedTags);
    } finally {
      setSavingTags(false);
    }
  };
  const handleSaveTags = async () => {
    setSavingTags(true);
    setTagsStatus({ type: null, message: "" });
    console.log("[Settings] Saving tags:", predefinedTags);
    try {
      const response = await fetch("/api/changelog/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ tags: predefinedTags })
      });
      console.log("[Settings] Response status:", response.status);
      console.log("[Settings] Response ok:", response.ok);
      const data = await response.json();
      console.log("[Settings] Response data:", data);
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      if (data.success) {
        setTagsStatus({
          type: "success",
          message: "Tags saved successfully"
        });
      } else {
        setTagsStatus({
          type: "error",
          message: data.error || "Failed to save tags"
        });
      }
    } catch (error) {
      console.error("[Settings] Error saving tags:", error);
      setTagsStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save tags"
      });
    } finally {
      setSavingTags(false);
    }
  };
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };
  const handleSaveHomeUrl = async () => {
    setSavingHomeUrl(true);
    setHomeUrlStatus({ type: null, message: "" });
    try {
      const response = await fetch("/api/changelog/home-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ homeUrl })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }
      if (data.success) {
        setHomeUrlStatus({
          type: "success",
          message: "Home URL saved successfully"
        });
      } else {
        setHomeUrlStatus({
          type: "error",
          message: data.error || "Failed to save home URL"
        });
      }
    } catch (error) {
      console.error("[Settings] Error saving home URL:", error);
      setHomeUrlStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save home URL"
      });
    } finally {
      setSavingHomeUrl(false);
    }
  };
  const formatRemoteUrl = (url) => {
    if (!url) return "Not configured";
    const httpsUrl = url.replace(/git@github\.com:/, "https://github.com/").replace(/git@gitlab\.com:/, "https://gitlab.com/").replace(/\.git$/, "");
    return httpsUrl;
  };
  if (loading) {
    return /* @__PURE__ */ jsx(AdminLayout, { children: /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-6 py-8", children: /* @__PURE__ */ jsx("div", { className: "text-zinc-600 dark:text-zinc-400", children: "Loading..." }) }) });
  }
  return /* @__PURE__ */ jsxs(AdminLayout, { children: [
    tagsStatus.type === "success" && /* @__PURE__ */ jsx("div", { className: "fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-green-200 bg-white px-4 py-3 shadow-lg dark:border-green-800 dark:bg-zinc-900", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-green-600 dark:text-green-400" }) }),
      /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-zinc-900 dark:text-zinc-50", children: tagsStatus.message }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setTagsStatus({ type: null, message: "" }),
          className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
          "aria-label": "Dismiss",
          children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }) }),
    tagsStatus.type === "error" && /* @__PURE__ */ jsx("div", { className: "fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 shadow-lg dark:border-red-800 dark:bg-zinc-900", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5 text-red-600 dark:text-red-400" }) }),
      /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-zinc-900 dark:text-zinc-50", children: tagsStatus.message }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setTagsStatus({ type: null, message: "" }),
          className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
          "aria-label": "Dismiss",
          children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }) }),
    homeUrlStatus.type === "success" && /* @__PURE__ */ jsx("div", { className: "fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-green-200 bg-white px-4 py-3 shadow-lg dark:border-green-800 dark:bg-zinc-900", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30", children: /* @__PURE__ */ jsx(CheckCircle2, { className: "h-5 w-5 text-green-600 dark:text-green-400" }) }),
      /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-zinc-900 dark:text-zinc-50", children: homeUrlStatus.message }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setHomeUrlStatus({ type: null, message: "" }),
          className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
          "aria-label": "Dismiss",
          children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }) }),
    homeUrlStatus.type === "error" && /* @__PURE__ */ jsx("div", { className: "fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 shadow-lg dark:border-red-800 dark:bg-zinc-900", children: [
      /* @__PURE__ */ jsx("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30", children: /* @__PURE__ */ jsx(X, { className: "h-5 w-5 text-red-600 dark:text-red-400" }) }),
      /* @__PURE__ */ jsx("div", { className: "flex-1", children: /* @__PURE__ */ jsx("p", { className: "text-sm font-medium text-zinc-900 dark:text-zinc-50", children: homeUrlStatus.message }) }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setHomeUrlStatus({ type: null, message: "" }),
          className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
          "aria-label": "Dismiss",
          children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mx-auto max-w-7xl px-6 py-8", children: /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50", children: "Repository Information" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300", children: "Git Status" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-600 dark:text-zinc-400", children: "Git installed:" }),
                repoInfo?.isGitInstalled ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-green-500" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-green-700 dark:text-green-400", children: "Yes" })
                ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-red-500" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-red-700 dark:text-red-400", children: "No" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-600 dark:text-zinc-400", children: "Git repository:" }),
                repoInfo?.isGitRepository ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-green-500" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-green-700 dark:text-green-400", children: "Yes" })
                ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-yellow-500" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-yellow-700 dark:text-yellow-400", children: "No" })
                ] })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-t border-zinc-200 pt-6 dark:border-zinc-800", children: [
            /* @__PURE__ */ jsx("label", { className: "mb-3 block text-sm font-medium text-zinc-700 dark:text-zinc-300", children: "Environment Variables" }),
            /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-600 dark:text-zinc-400", children: "CHRONALOG_GITHUB_ID:" }),
                repoInfo?.envVars?.CHRONALOG_GITHUB_ID ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-green-500" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-green-700 dark:text-green-400", children: "Set" })
                ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-red-500" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-red-700 dark:text-red-400", children: "Not set" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-600 dark:text-zinc-400", children: "CHRONALOG_GITHUB_SECRET:" }),
                repoInfo?.envVars?.CHRONALOG_GITHUB_SECRET ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-green-500" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-green-700 dark:text-green-400", children: "Set" })
                ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-1.5", children: [
                  /* @__PURE__ */ jsx("div", { className: "h-2 w-2 rounded-full bg-red-500" }),
                  /* @__PURE__ */ jsx("span", { className: "text-sm font-medium text-red-700 dark:text-red-400", children: "Not set" })
                ] })
              ] })
            ] })
          ] }),
          repoInfo?.isGitRepository && /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("div", { className: "border-t border-zinc-200 pt-6 dark:border-zinc-800", children: [
              /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300", children: "Repository URL" }),
              /* @__PURE__ */ jsx("div", { className: "mt-2", children: repoInfo.remoteUrl ? /* @__PURE__ */ jsx(
                "a",
                {
                  href: formatRemoteUrl(repoInfo.remoteUrl),
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300",
                  children: formatRemoteUrl(repoInfo.remoteUrl)
                }
              ) : /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-500 dark:text-zinc-400", children: "No remote configured" }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "border-t border-zinc-200 pt-6 dark:border-zinc-800", children: [
              /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300", children: "Current Branch" }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 flex items-center gap-2", children: [
                /* @__PURE__ */ jsx(GitBranch, { className: "h-4 w-4 text-zinc-500 dark:text-zinc-400" }),
                /* @__PURE__ */ jsx("span", { className: "text-sm font-mono text-zinc-900 dark:text-zinc-50", children: repoInfo.branch || "Unknown" })
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50", children: "Configuration" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300", children: "Changelog Directory" }),
            /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsx("span", { className: "inline-flex items-center rounded-md bg-zinc-50 px-3 py-2 text-sm font-mono text-zinc-900 ring-1 ring-inset ring-zinc-300 dark:bg-zinc-800/50 dark:text-zinc-50 dark:ring-zinc-700", children: repoInfo?.changelogDir || "changelog" }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "border-t border-zinc-200 pt-6 dark:border-zinc-800", children: [
            /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300", children: "Home URL" }),
            /* @__PURE__ */ jsx("p", { className: "mb-3 text-sm text-zinc-600 dark:text-zinc-400", children: "Configure where the home button in the navbar takes you." }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: homeUrl,
                  onChange: (e) => setHomeUrl(e.target.value),
                  className: "flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50",
                  placeholder: "/"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: handleSaveHomeUrl,
                  disabled: savingHomeUrl,
                  className: "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600",
                  children: savingHomeUrl ? "Saving..." : "Save"
                }
              )
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900", children: [
        /* @__PURE__ */ jsx("h2", { className: "mb-6 text-lg font-semibold text-zinc-900 dark:text-zinc-50", children: "Predefined Tags" }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("p", { className: "text-sm text-zinc-600 dark:text-zinc-400", children: [
            "Define tags that will be available for selection when creating changelog entries. Tags are saved to ",
            /* @__PURE__ */ jsx("code", { className: "rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800", children: "chronalog/config.json" }),
            " in your project root."
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300", children: "Tags" }),
            /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2 rounded-lg border border-zinc-300 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-900", children: predefinedTags.length === 0 ? /* @__PURE__ */ jsx("span", { className: "text-sm text-zinc-500 dark:text-zinc-400", children: "No tags defined yet. Add your first tag below." }) : predefinedTags.map((tag) => /* @__PURE__ */ jsxs(
              "span",
              {
                className: "flex items-center gap-1 rounded-full bg-zinc-200 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                children: [
                  tag,
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      onClick: () => handleRemoveTag(tag),
                      className: "ml-1 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-700",
                      "aria-label": `Remove ${tag} tag`,
                      children: /* @__PURE__ */ jsx(
                        "svg",
                        {
                          className: "h-3 w-3",
                          fill: "none",
                          stroke: "currentColor",
                          viewBox: "0 0 24 24",
                          children: /* @__PURE__ */ jsx(
                            "path",
                            {
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              strokeWidth: 2,
                              d: "M6 18L18 6M6 6l12 12"
                            }
                          )
                        }
                      )
                    }
                  )
                ]
              },
              tag
            )) })
          ] }),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { className: "mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300", children: "Add New Tag" }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  value: newTag,
                  onChange: (e) => setNewTag(e.target.value),
                  onKeyDown: handleTagKeyDown,
                  className: "flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50",
                  placeholder: "Enter tag name and press Enter"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  onClick: handleAddTag,
                  className: "rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
                  children: "Add"
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: handleSaveTags,
              disabled: savingTags,
              className: "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600",
              children: savingTags ? "Saving..." : "Save Tags"
            }
          ) })
        ] })
      ] })
    ] }) })
  ] });
}
export {
  SettingsPage as default
};
