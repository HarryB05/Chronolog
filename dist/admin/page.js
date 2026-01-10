"use client";
import {
  Editor
} from "../chunk-WLXT2X5R.js";
import {
  AdminLayout
} from "../chunk-3FTQJUGE.js";
import "../chunk-MRX454HA.js";
import "../chunk-ZBPJITHK.js";
import "../chunk-4A7WWWIL.js";
import "../chunk-C33QSZGG.js";
import "../chunk-VPMYIZYL.js";

// src/admin/page.tsx
import { useState as useState2, useEffect, useMemo as useMemo2 } from "react";
import ReactMarkdown from "react-markdown";
import { ChevronDown, ChevronUp, Edit, CheckCircle2, X } from "lucide-react";

// src/admin/components/ui/commit-combobox.tsx
import * as React4 from "react";
import { Check, ChevronsUpDown } from "lucide-react";

// src/admin/components/ui/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/admin/components/ui/button.tsx
import * as React from "react";
import { jsx } from "react/jsx-runtime";
var Button = React.forwardRef(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "button",
      {
        className: cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-zinc-300",
          {
            "bg-zinc-900 text-zinc-50 hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90": variant === "default",
            "border border-zinc-200 bg-white hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-800 dark:hover:text-zinc-50": variant === "outline",
            "hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50": variant === "ghost",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg"
          },
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Button.displayName = "Button";

// src/admin/components/ui/command.tsx
import * as React2 from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";
import { jsx as jsx2, jsxs } from "react/jsx-runtime";
var Command = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx2(
  CommandPrimitive,
  {
    ref,
    className: cn(
      "flex h-full w-full flex-col overflow-hidden rounded-md bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50",
      className
    ),
    ...props
  }
));
Command.displayName = CommandPrimitive.displayName;
var CommandInput = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxs("div", { className: "flex items-center border-b border-zinc-200 px-3 dark:border-zinc-800", "cmdk-input-wrapper": "", children: [
  /* @__PURE__ */ jsx2(Search, { className: "mr-2 h-4 w-4 shrink-0 opacity-50" }),
  /* @__PURE__ */ jsx2(
    CommandPrimitive.Input,
    {
      ref,
      className: cn(
        "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-zinc-400",
        className
      ),
      ...props
    }
  )
] }));
CommandInput.displayName = CommandPrimitive.Input.displayName;
var CommandList = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx2(
  CommandPrimitive.List,
  {
    ref,
    className: cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className),
    ...props
  }
));
CommandList.displayName = CommandPrimitive.List.displayName;
var CommandEmpty = React2.forwardRef((props, ref) => /* @__PURE__ */ jsx2(
  CommandPrimitive.Empty,
  {
    ref,
    className: "py-6 text-center text-sm text-zinc-500 dark:text-zinc-400",
    ...props
  }
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;
var CommandGroup = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx2(
  CommandPrimitive.Group,
  {
    ref,
    className: cn(
      "overflow-hidden p-1 text-zinc-950 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-zinc-500 dark:text-zinc-50 dark:[&_[cmdk-group-heading]]:text-zinc-400",
      className
    ),
    ...props
  }
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;
var CommandSeparator = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx2(
  CommandPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 h-px bg-zinc-200 dark:bg-zinc-800", className),
    ...props
  }
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;
var CommandItem = React2.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx2(
  CommandPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-zinc-100 aria-selected:text-zinc-900 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50",
      className
    ),
    ...props
  }
));
CommandItem.displayName = CommandPrimitive.Item.displayName;
var CommandShortcut = ({
  className,
  ...props
}) => {
  return /* @__PURE__ */ jsx2(
    "span",
    {
      className: cn(
        "ml-auto text-xs tracking-widest text-zinc-500 dark:text-zinc-400",
        className
      ),
      ...props
    }
  );
};
CommandShortcut.displayName = "CommandShortcut";

// src/admin/components/ui/popover.tsx
import * as React3 from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { jsx as jsx3 } from "react/jsx-runtime";
var Popover = PopoverPrimitive.Root;
var PopoverTrigger = PopoverPrimitive.Trigger;
var PopoverContent = React3.forwardRef(({ className, align = "center", sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx3(PopoverPrimitive.Portal, { children: /* @__PURE__ */ jsx3(
  PopoverPrimitive.Content,
  {
    ref,
    align,
    sideOffset,
    className: cn(
      "z-50 w-72 rounded-md border border-zinc-200 bg-white p-4 text-zinc-950 shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
      className
    ),
    ...props
  }
) }));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

// src/admin/components/ui/commit-combobox.tsx
import { jsx as jsx4, jsxs as jsxs2 } from "react/jsx-runtime";
function CommitCombobox({
  commits,
  value,
  onValueChange,
  isLoading = false,
  disabled = false
}) {
  const [open, setOpen] = React4.useState(false);
  const [search, setSearch] = React4.useState("");
  const selectedCommit = commits.find((commit) => commit.hash === value);
  const filteredCommits = React4.useMemo(() => {
    if (!search) return commits;
    const searchLower = search.toLowerCase();
    return commits.filter(
      (commit) => commit.hash.toLowerCase().includes(searchLower) || commit.shortHash.toLowerCase().includes(searchLower) || commit.message.toLowerCase().includes(searchLower) || commit.author.toLowerCase().includes(searchLower)
    );
  }, [commits, search]);
  return /* @__PURE__ */ jsxs2(Popover, { open, onOpenChange: (newOpen) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearch("");
    }
  }, children: [
    /* @__PURE__ */ jsx4(PopoverTrigger, { asChild: true, children: /* @__PURE__ */ jsxs2(
      Button,
      {
        variant: "outline",
        role: "combobox",
        "aria-expanded": open,
        className: "w-full justify-between",
        disabled: disabled || isLoading || commits.length === 0,
        children: [
          isLoading ? "Loading commits..." : commits.length === 0 ? "No commits found" : selectedCommit ? `${selectedCommit.shortHash} - ${selectedCommit.message}` : "Select a commit",
          /* @__PURE__ */ jsx4(ChevronsUpDown, { className: "ml-2 h-4 w-4 shrink-0 opacity-50" })
        ]
      }
    ) }),
    /* @__PURE__ */ jsx4(PopoverContent, { className: "w-[var(--radix-popover-trigger-width)] p-0", align: "start", children: /* @__PURE__ */ jsxs2(Command, { shouldFilter: false, children: [
      /* @__PURE__ */ jsx4(
        CommandInput,
        {
          placeholder: "Search commits by hash, message, or author...",
          value: search,
          onValueChange: setSearch
        }
      ),
      /* @__PURE__ */ jsxs2(CommandList, { children: [
        (isLoading || filteredCommits.length === 0) && /* @__PURE__ */ jsx4(CommandEmpty, { children: isLoading ? "Loading..." : "No commits found." }),
        filteredCommits.map((commit) => {
          const searchValue = `${commit.hash} ${commit.shortHash} ${commit.message} ${commit.author}`;
          const handleSelect = () => {
            onValueChange(commit.hash === value ? "" : commit.hash);
            setOpen(false);
          };
          return /* @__PURE__ */ jsxs2(
            "div",
            {
              role: "option",
              onClick: handleSelect,
              onKeyDown: (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleSelect();
                }
              },
              className: "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-zinc-100 hover:text-zinc-900 aria-selected:bg-zinc-100 aria-selected:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50",
              "aria-selected": value === commit.hash,
              tabIndex: 0,
              children: [
                /* @__PURE__ */ jsx4(
                  Check,
                  {
                    className: cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === commit.hash ? "opacity-100" : "opacity-0"
                    )
                  }
                ),
                /* @__PURE__ */ jsxs2("div", { className: "flex flex-col flex-1", children: [
                  /* @__PURE__ */ jsx4("span", { className: "font-mono text-xs text-zinc-500 dark:text-zinc-400", children: commit.shortHash }),
                  /* @__PURE__ */ jsx4("span", { className: "text-sm", children: commit.message }),
                  /* @__PURE__ */ jsx4("span", { className: "text-xs text-zinc-500 dark:text-zinc-400", children: commit.author })
                ] })
              ]
            },
            commit.hash
          );
        })
      ] })
    ] }) })
  ] });
}

// src/version.ts
function incrementVersion(version, type) {
  const cleanVersion = version.replace(/^v/i, "");
  const parts = cleanVersion.split(".");
  const major = parseInt(parts[0] || "0", 10);
  const minor = parseInt(parts[1] || "0", 10);
  const patch = parseInt(parts[2] || "0", 10);
  let newMajor = major;
  let newMinor = minor;
  let newPatch = patch;
  switch (type) {
    case "major":
      newMajor = major + 1;
      newMinor = 0;
      newPatch = 0;
      break;
    case "minor":
      newMinor = minor + 1;
      newPatch = 0;
      break;
    case "patch":
      newPatch = patch + 1;
      break;
  }
  return `${newMajor}.${newMinor}.${newPatch}`;
}
function isValidVersion(version) {
  const cleanVersion = version.replace(/^v/i, "");
  const semverPattern = /^\d+\.\d+\.\d+$/;
  return semverPattern.test(cleanVersion);
}

// src/admin/page.tsx
import { Fragment, jsx as jsx5, jsxs as jsxs3 } from "react/jsx-runtime";
function ChangelogAdminPage() {
  const [title, setTitle] = useState2("");
  const [version, setVersion] = useState2("");
  const [date, setDate] = useState2((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [tags, setTags] = useState2([]);
  const [tagInput, setTagInput] = useState2("");
  const [features, setFeatures] = useState2([]);
  const [featureInput, setFeatureInput] = useState2("");
  const [editingFeature, setEditingFeature] = useState2(null);
  const [editingFeatureValue, setEditingFeatureValue] = useState2("");
  const [bugfixes, setBugfixes] = useState2([]);
  const [bugfixInput, setBugfixInput] = useState2("");
  const [editingBugfix, setEditingBugfix] = useState2(null);
  const [editingBugfixValue, setEditingBugfixValue] = useState2("");
  const [body, setBody] = useState2("");
  const [isSaving, setIsSaving] = useState2(false);
  const [latestEntry, setLatestEntry] = useState2(null);
  const [allEntries, setAllEntries] = useState2([]);
  const [showVersionIncrement, setShowVersionIncrement] = useState2(false);
  const [saveStatus, setSaveStatus] = useState2({ type: null, message: "" });
  const [repoInfo, setRepoInfo] = useState2(null);
  const [expandedEntries, setExpandedEntries] = useState2(/* @__PURE__ */ new Set());
  const [selectedMajorVersion, setSelectedMajorVersion] = useState2(null);
  const [selectedMinorVersion, setSelectedMinorVersion] = useState2(null);
  const [predefinedTags, setPredefinedTags] = useState2([]);
  const [commits, setCommits] = useState2([]);
  const [selectedCommitHash, setSelectedCommitHash] = useState2("");
  const [isLoadingCommits, setIsLoadingCommits] = useState2(false);
  const [editingSlug, setEditingSlug] = useState2(null);
  useEffect(() => {
    async function fetchData() {
      try {
        const [latestResponse, listResponse, settingsResponse] = await Promise.all([
          fetch("/api/changelog/latest"),
          fetch("/api/changelog/list"),
          fetch("/api/changelog/settings")
        ]);
        const latestData = await latestResponse.json();
        const listData = await listResponse.json();
        const settingsData = await settingsResponse.json();
        if (latestData.success && latestData.entry) {
          setLatestEntry(latestData.entry);
        }
        if (listData.success && listData.entries) {
          setAllEntries(listData.entries);
        }
        if (settingsData.success && settingsData.info?.remoteUrl) {
          const remoteUrl = settingsData.info.remoteUrl;
          const match = remoteUrl.match(/(?:github\.com[/:]|git@github\.com:)([^/]+)\/([^/]+?)(?:\.git)?$/);
          if (match) {
            setRepoInfo({
              owner: match[1],
              name: match[2].replace(".git", "")
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    }
    fetchData();
  }, []);
  useEffect(() => {
    if (saveStatus.type === "success") {
      const timer = setTimeout(() => {
        setSaveStatus({ type: null, message: "" });
      }, 3e3);
      return () => clearTimeout(timer);
    }
  }, [saveStatus.type]);
  const handleVersionIncrement = (type) => {
    if (latestEntry?.version && isValidVersion(latestEntry.version)) {
      const newVersion = incrementVersion(latestEntry.version, type);
      setVersion(newVersion);
      setShowVersionIncrement(false);
    }
  };
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedTag = tagInput.trim();
      if (trimmedTag && !tags.includes(trimmedTag.toLowerCase())) {
        setTags([...tags, trimmedTag.toLowerCase()]);
        setTagInput("");
      }
    }
  };
  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };
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
    async function fetchCommits() {
      setIsLoadingCommits(true);
      try {
        const response = await fetch("/api/changelog/commits");
        const data = await response.json();
        if (data.success && data.commits) {
          setCommits(data.commits);
        }
      } catch (error) {
        console.error("Failed to fetch git commits:", error);
      } finally {
        setIsLoadingCommits(false);
      }
    }
    fetchCommits();
  }, []);
  const handleSelectPredefinedTag = (tag) => {
    if (!tags.includes(tag.toLowerCase())) {
      setTags([...tags, tag.toLowerCase()]);
    }
  };
  const handleFeatureKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedFeature = featureInput.trim();
      if (trimmedFeature) {
        setFeatures([...features, trimmedFeature]);
        setFeatureInput("");
      }
    }
  };
  const removeFeature = (indexToRemove) => {
    setFeatures(features.filter((_, index) => index !== indexToRemove));
  };
  const startEditingFeature = (index, value) => {
    setEditingFeature(index);
    setEditingFeatureValue(value);
  };
  const saveFeatureEdit = (index) => {
    if (editingFeatureValue.trim()) {
      const newFeatures = [...features];
      newFeatures[index] = editingFeatureValue.trim();
      setFeatures(newFeatures);
    }
    setEditingFeature(null);
    setEditingFeatureValue("");
  };
  const cancelFeatureEdit = () => {
    setEditingFeature(null);
    setEditingFeatureValue("");
  };
  const handleBugfixKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmedBugfix = bugfixInput.trim();
      if (trimmedBugfix) {
        setBugfixes([...bugfixes, trimmedBugfix]);
        setBugfixInput("");
      }
    }
  };
  const removeBugfix = (indexToRemove) => {
    setBugfixes(bugfixes.filter((_, index) => index !== indexToRemove));
  };
  const startEditingBugfix = (index, value) => {
    setEditingBugfix(index);
    setEditingBugfixValue(value);
  };
  const saveBugfixEdit = (index) => {
    if (editingBugfixValue.trim()) {
      const newBugfixes = [...bugfixes];
      newBugfixes[index] = editingBugfixValue.trim();
      setBugfixes(newBugfixes);
    }
    setEditingBugfix(null);
    setEditingBugfixValue("");
  };
  const cancelBugfixEdit = () => {
    setEditingBugfix(null);
    setEditingBugfixValue("");
  };
  const loadEntryForEditing = (entry) => {
    setEditingSlug(entry.slug);
    setTitle(entry.title);
    setVersion(entry.version || "");
    const dateStr = entry.date ? new Date(entry.date).toISOString().split("T")[0] : (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    setDate(dateStr);
    setTags(entry.tags || []);
    setTagInput("");
    setFeatures(entry.features || []);
    setFeatureInput("");
    setBugfixes(entry.bugfixes || []);
    setBugfixInput("");
    setBody(entry.body || "");
    setSelectedCommitHash(entry.commitHash || "");
    setShowVersionIncrement(false);
    setSaveStatus({ type: null, message: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const cancelEditing = () => {
    setEditingSlug(null);
    setTitle("");
    setVersion("");
    setDate((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
    setTags([]);
    setTagInput("");
    setFeatures([]);
    setFeatureInput("");
    setBugfixes([]);
    setBugfixInput("");
    setBody("");
    setSelectedCommitHash("");
    setShowVersionIncrement(false);
    setSaveStatus({ type: null, message: "" });
  };
  const refreshEntries = async () => {
    try {
      const [latestResponse, listResponse] = await Promise.all([
        fetch("/api/changelog/latest"),
        fetch("/api/changelog/list")
      ]);
      const latestData = await latestResponse.json();
      const listData = await listResponse.json();
      if (latestData.success && latestData.entry) {
        setLatestEntry(latestData.entry);
      }
      if (listData.success && listData.entries) {
        setAllEntries(listData.entries);
      }
    } catch (error) {
      console.error("Failed to refresh entries:", error);
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus({ type: null, message: "" });
    try {
      const response = await fetch("/api/changelog/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title,
          version: version.trim(),
          date: date || void 0,
          tags: tags.length > 0 ? tags : void 0,
          features: features.length > 0 ? features : void 0,
          bugfixes: bugfixes.length > 0 ? bugfixes : void 0,
          body,
          commitHash: selectedCommitHash || void 0,
          slug: editingSlug || void 0
        })
      });
      const data = await response.json();
      if (data.success) {
        setSaveStatus({
          type: "success",
          message: data.message
        });
        const gitCommit = data.gitCommit;
        if (gitCommit) {
          if (gitCommit.success) {
            setSaveStatus((prev) => ({
              ...prev,
              message: `${prev.message} (committed to Git)`
            }));
          } else if (gitCommit.error) {
            setSaveStatus((prev) => ({
              ...prev,
              message: `${prev.message} (Git commit failed: ${gitCommit.error})`
            }));
          }
        }
        setTimeout(() => {
          setEditingSlug(null);
          setTitle("");
          setVersion("");
          setDate((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
          setTags([]);
          setTagInput("");
          setFeatures([]);
          setFeatureInput("");
          setBugfixes([]);
          setBugfixInput("");
          setBody("");
          setSelectedCommitHash("");
          setShowVersionIncrement(false);
          setSaveStatus({ type: null, message: "" });
          refreshEntries();
        }, 3e3);
      } else {
        setSaveStatus({
          type: "error",
          message: data.error || "Failed to save changelog entry"
        });
      }
    } catch (error) {
      setSaveStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to save changelog entry"
      });
    } finally {
      setIsSaving(false);
    }
  };
  const formatDate = (dateString) => {
    const date2 = new Date(dateString);
    return date2.toLocaleDateString("en-GB", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };
  const uniqueVersions = useMemo2(() => {
    const allVersions = allEntries.map((entry) => entry.version).filter((v) => !!v);
    const majorVersions = /* @__PURE__ */ new Set();
    allVersions.forEach((version2) => {
      const major = version2.split(".")[0];
      majorVersions.add(major);
    });
    const versions = Array.from(majorVersions).map((major) => `${major}.0.0`).sort((a, b) => {
      const aParts = a.split(".").map(Number);
      const bParts = b.split(".").map(Number);
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || 0;
        const bPart = bParts[i] || 0;
        if (aPart !== bPart) return bPart - aPart;
      }
      return 0;
    });
    return versions;
  }, [allEntries]);
  const minorVersions = useMemo2(() => {
    if (!selectedMajorVersion) return [];
    const majorVersion = selectedMajorVersion.split(".")[0];
    const allVersions = allEntries.map((entry) => entry.version).filter((v) => !!v).filter((v) => {
      const entryMajor = v.split(".")[0];
      return entryMajor === majorVersion;
    }).filter((v) => {
      const parts = v.split(".").map(Number);
      return parts.length >= 3 && parts[2] === 0;
    }).filter((v, index, self) => self.indexOf(v) === index).sort((a, b) => {
      const aParts = a.split(".").map(Number);
      const bParts = b.split(".").map(Number);
      for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aPart = aParts[i] || 0;
        const bPart = bParts[i] || 0;
        if (aPart !== bPart) return bPart - aPart;
      }
      return 0;
    });
    return allVersions;
  }, [allEntries, selectedMajorVersion]);
  const filteredEntries = useMemo2(() => {
    if (!selectedMajorVersion) return allEntries;
    const majorVersion = selectedMajorVersion.split(".")[0];
    let filtered = allEntries.filter((entry) => {
      if (!entry.version) return false;
      const entryMajor = entry.version.split(".")[0];
      return entryMajor === majorVersion;
    });
    if (selectedMinorVersion) {
      const minorVersionParts = selectedMinorVersion.split(".");
      if (minorVersionParts.length >= 2) {
        const majorMinorPrefix = `${minorVersionParts[0]}.${minorVersionParts[1]}.`;
        filtered = filtered.filter((entry) => {
          return entry.version?.startsWith(majorMinorPrefix);
        });
      }
    }
    return filtered;
  }, [allEntries, selectedMajorVersion, selectedMinorVersion]);
  const toggleExpand = (slug) => {
    setExpandedEntries((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(slug)) {
        newSet.delete(slug);
      } else {
        newSet.add(slug);
      }
      return newSet;
    });
  };
  const shouldTruncate = (entry) => {
    const contentLength = entry.title.length + (entry.body?.length || 0) + (entry.features?.join(" ").length || 0) + (entry.bugfixes?.join(" ").length || 0);
    return contentLength > 500;
  };
  const editingEntry = editingSlug ? allEntries.find((entry) => entry.slug === editingSlug) : null;
  return /* @__PURE__ */ jsxs3(AdminLayout, { children: [
    saveStatus.type === "success" && /* @__PURE__ */ jsx5("div", { className: "fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0", children: /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3 rounded-lg border border-green-200 bg-white px-4 py-3 shadow-lg dark:border-green-800 dark:bg-zinc-900", children: [
      /* @__PURE__ */ jsx5("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30", children: /* @__PURE__ */ jsx5(CheckCircle2, { className: "h-5 w-5 text-green-600 dark:text-green-400" }) }),
      /* @__PURE__ */ jsx5("div", { className: "flex-1", children: /* @__PURE__ */ jsx5("p", { className: "text-sm font-medium text-zinc-900 dark:text-zinc-50", children: saveStatus.message }) }),
      /* @__PURE__ */ jsx5(
        "button",
        {
          type: "button",
          onClick: () => setSaveStatus({ type: null, message: "" }),
          className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
          "aria-label": "Dismiss",
          children: /* @__PURE__ */ jsx5(X, { className: "h-4 w-4" })
        }
      )
    ] }) }),
    saveStatus.type === "error" && /* @__PURE__ */ jsx5("div", { className: "fixed top-4 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-top-5 fade-in-0", children: /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-3 rounded-lg border border-red-200 bg-white px-4 py-3 shadow-lg dark:border-red-800 dark:bg-zinc-900", children: [
      /* @__PURE__ */ jsx5("div", { className: "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30", children: /* @__PURE__ */ jsx5(X, { className: "h-5 w-5 text-red-600 dark:text-red-400" }) }),
      /* @__PURE__ */ jsx5("div", { className: "flex-1", children: /* @__PURE__ */ jsx5("p", { className: "text-sm font-medium text-zinc-900 dark:text-zinc-50", children: saveStatus.message }) }),
      /* @__PURE__ */ jsx5(
        "button",
        {
          type: "button",
          onClick: () => setSaveStatus({ type: null, message: "" }),
          className: "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
          "aria-label": "Dismiss",
          children: /* @__PURE__ */ jsx5(X, { className: "h-4 w-4" })
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx5("div", { className: "mx-auto max-w-7xl px-6 py-8", children: /* @__PURE__ */ jsxs3("div", { className: "grid grid-cols-1 gap-8 lg:grid-cols-[2fr_1fr]", children: [
      /* @__PURE__ */ jsxs3("div", { className: "space-y-6", children: [
        /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx5("h2", { className: "text-2xl font-bold text-zinc-900 dark:text-zinc-50", children: editingSlug && editingEntry ? `Edit: ${editingEntry.title}` : "Create Changelog Entry" }),
          editingSlug && /* @__PURE__ */ jsx5(
            "button",
            {
              type: "button",
              onClick: cancelEditing,
              className: "rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
              children: "Cancel"
            }
          )
        ] }),
        editingSlug && /* @__PURE__ */ jsx5("div", { className: "rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20", children: /* @__PURE__ */ jsx5("p", { className: "text-sm font-medium text-blue-900 dark:text-blue-200", children: "You are editing an existing changelog entry. Changes will update the existing entry." }) }),
        /* @__PURE__ */ jsxs3("form", { onSubmit: handleSubmit, className: "space-y-6", children: [
          /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsxs3(
              "label",
              {
                htmlFor: "title",
                className: "mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50",
                children: [
                  "Title ",
                  /* @__PURE__ */ jsx5("span", { className: "text-red-500", children: "*" })
                ]
              }
            ),
            /* @__PURE__ */ jsx5(
              "input",
              {
                type: "text",
                id: "title",
                value: title,
                onChange: (e) => setTitle(e.target.value),
                required: true,
                className: "w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50",
                placeholder: "e.g., New Feature: Authentication System"
              }
            )
          ] }),
          /* @__PURE__ */ jsxs3("div", { className: "grid grid-cols-2 gap-4", children: [
            /* @__PURE__ */ jsxs3("div", { children: [
              /* @__PURE__ */ jsxs3("div", { className: "mb-2 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxs3(
                  "label",
                  {
                    htmlFor: "version",
                    className: "block text-sm font-medium text-zinc-900 dark:text-zinc-50",
                    children: [
                      "Version ",
                      /* @__PURE__ */ jsx5("span", { className: "text-red-500", children: "*" })
                    ]
                  }
                ),
                latestEntry?.version && !editingSlug && /* @__PURE__ */ jsx5(
                  "button",
                  {
                    type: "button",
                    onClick: () => setShowVersionIncrement(!showVersionIncrement),
                    className: "text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50",
                    children: showVersionIncrement ? "Cancel" : "Increment from " + latestEntry.version
                  }
                )
              ] }),
              showVersionIncrement && latestEntry?.version && !editingSlug && /* @__PURE__ */ jsxs3("div", { className: "mb-2 flex gap-2", children: [
                /* @__PURE__ */ jsx5(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleVersionIncrement("major"),
                    className: "flex-1 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30",
                    children: "Major"
                  }
                ),
                /* @__PURE__ */ jsx5(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleVersionIncrement("minor"),
                    className: "flex-1 rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30",
                    children: "Minor"
                  }
                ),
                /* @__PURE__ */ jsx5(
                  "button",
                  {
                    type: "button",
                    onClick: () => handleVersionIncrement("patch"),
                    className: "flex-1 rounded-lg border border-green-300 bg-green-50 px-3 py-2 text-xs font-medium text-green-700 transition-colors hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30",
                    children: "Patch"
                  }
                )
              ] }),
              /* @__PURE__ */ jsx5(
                "input",
                {
                  type: "text",
                  id: "version",
                  value: version,
                  onChange: (e) => setVersion(e.target.value),
                  disabled: !!editingSlug,
                  className: `w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${editingSlug ? "cursor-not-allowed opacity-60" : ""}`,
                  placeholder: "e.g., 1.0.0"
                }
              ),
              editingSlug && /* @__PURE__ */ jsx5("p", { className: "mt-1 text-xs text-zinc-500 dark:text-zinc-400", children: "Version cannot be changed when editing" })
            ] }),
            /* @__PURE__ */ jsxs3("div", { children: [
              /* @__PURE__ */ jsx5(
                "label",
                {
                  htmlFor: "date",
                  className: "mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50",
                  children: "Date"
                }
              ),
              /* @__PURE__ */ jsx5(
                "input",
                {
                  type: "date",
                  id: "date",
                  value: date,
                  onChange: (e) => setDate(e.target.value),
                  disabled: !!editingSlug,
                  className: `w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 ${editingSlug ? "cursor-not-allowed opacity-60" : ""}`
                }
              ),
              editingSlug && /* @__PURE__ */ jsx5("p", { className: "mt-1 text-xs text-zinc-500 dark:text-zinc-400", children: "Date cannot be changed when editing" })
            ] })
          ] }),
          /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsx5(
              "label",
              {
                htmlFor: "tags",
                className: "mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50",
                children: "Tags"
              }
            ),
            predefinedTags.length > 0 && /* @__PURE__ */ jsxs3("div", { className: "mb-3", children: [
              /* @__PURE__ */ jsx5("p", { className: "mb-2 text-xs text-zinc-500 dark:text-zinc-400", children: "Predefined tags:" }),
              /* @__PURE__ */ jsx5("div", { className: "flex flex-wrap gap-2", children: predefinedTags.map((tag) => /* @__PURE__ */ jsxs3(
                "button",
                {
                  type: "button",
                  onClick: () => handleSelectPredefinedTag(tag),
                  disabled: tags.includes(tag.toLowerCase()),
                  className: `rounded-full px-3 py-1 text-xs font-medium transition-colors ${tags.includes(tag.toLowerCase()) ? "cursor-not-allowed bg-zinc-300 text-zinc-500 dark:bg-zinc-700 dark:text-zinc-500" : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"}`,
                  children: [
                    tag,
                    tags.includes(tag.toLowerCase()) && /* @__PURE__ */ jsx5("span", { className: "ml-1", children: "\u2713" })
                  ]
                },
                tag
              )) })
            ] }),
            /* @__PURE__ */ jsxs3("div", { className: "flex flex-wrap gap-2 rounded-lg border border-zinc-300 bg-white p-2 focus-within:border-zinc-500 focus-within:ring-2 focus-within:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900", children: [
              tags.map((tag, index) => /* @__PURE__ */ jsxs3(
                "span",
                {
                  className: "flex items-center gap-1 rounded-full bg-zinc-200 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
                  children: [
                    tag,
                    /* @__PURE__ */ jsx5(
                      "button",
                      {
                        type: "button",
                        onClick: () => removeTag(tag),
                        className: "ml-1 rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-700",
                        "aria-label": `Remove ${tag} tag`,
                        children: /* @__PURE__ */ jsx5(
                          "svg",
                          {
                            className: "h-3 w-3",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                            children: /* @__PURE__ */ jsx5(
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
                index
              )),
              /* @__PURE__ */ jsx5(
                "input",
                {
                  type: "text",
                  id: "tags",
                  value: tagInput,
                  onChange: (e) => setTagInput(e.target.value),
                  onKeyDown: handleTagKeyDown,
                  className: "flex-1 border-0 bg-transparent px-2 py-1 text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-50 dark:placeholder:text-zinc-600",
                  placeholder: tags.length === 0 ? "Type a tag and press Enter" : "Add another tag"
                }
              )
            ] }),
            /* @__PURE__ */ jsx5("p", { className: "mt-1 text-xs text-zinc-500 dark:text-zinc-400", children: predefinedTags.length > 0 ? "Click predefined tags above or type a new tag and press Enter" : "Type a tag and press Enter to add it" })
          ] }),
          /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsx5(
              "label",
              {
                htmlFor: "features",
                className: "mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50",
                children: "Features"
              }
            ),
            /* @__PURE__ */ jsxs3("div", { className: "space-y-2", children: [
              features.map((feature, index) => /* @__PURE__ */ jsx5(
                "div",
                {
                  className: "group rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800",
                  children: editingFeature === index ? /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx5(
                      "input",
                      {
                        type: "text",
                        value: editingFeatureValue,
                        onChange: (e) => setEditingFeatureValue(e.target.value),
                        onKeyDown: (e) => {
                          if (e.key === "Enter") {
                            saveFeatureEdit(index);
                          } else if (e.key === "Escape") {
                            cancelFeatureEdit();
                          }
                        },
                        onBlur: () => saveFeatureEdit(index),
                        className: "flex-1 rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50",
                        autoFocus: true
                      }
                    ),
                    /* @__PURE__ */ jsx5(
                      "button",
                      {
                        type: "button",
                        onClick: () => saveFeatureEdit(index),
                        className: "rounded p-1 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20",
                        "aria-label": "Save",
                        children: /* @__PURE__ */ jsx5("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) })
                      }
                    ),
                    /* @__PURE__ */ jsx5(
                      "button",
                      {
                        type: "button",
                        onClick: cancelFeatureEdit,
                        className: "rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20",
                        "aria-label": "Cancel",
                        children: /* @__PURE__ */ jsx5("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
                      }
                    )
                  ] }) : /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx5(
                      "span",
                      {
                        className: "flex-1 cursor-pointer text-sm text-zinc-900 dark:text-zinc-50",
                        onClick: () => startEditingFeature(index, feature),
                        children: feature
                      }
                    ),
                    /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100", children: [
                      /* @__PURE__ */ jsx5(
                        "button",
                        {
                          type: "button",
                          onClick: () => startEditingFeature(index, feature),
                          className: "rounded p-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700",
                          "aria-label": "Edit",
                          children: /* @__PURE__ */ jsx5("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) })
                        }
                      ),
                      /* @__PURE__ */ jsx5(
                        "button",
                        {
                          type: "button",
                          onClick: () => removeFeature(index),
                          className: "rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20",
                          "aria-label": "Remove",
                          children: /* @__PURE__ */ jsx5("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
                        }
                      )
                    ] })
                  ] })
                },
                index
              )),
              /* @__PURE__ */ jsx5(
                "input",
                {
                  type: "text",
                  id: "features",
                  value: featureInput,
                  onChange: (e) => setFeatureInput(e.target.value),
                  onKeyDown: handleFeatureKeyDown,
                  className: "w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50",
                  placeholder: features.length === 0 ? "Type a feature and press Enter" : "Add another feature"
                }
              )
            ] }),
            /* @__PURE__ */ jsx5("p", { className: "mt-1 text-xs text-zinc-500 dark:text-zinc-400", children: "Type a feature and press Enter to add it" })
          ] }),
          /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsx5(
              "label",
              {
                htmlFor: "bugfixes",
                className: "mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50",
                children: "Bug Fixes"
              }
            ),
            /* @__PURE__ */ jsxs3("div", { className: "space-y-2", children: [
              bugfixes.map((bugfix, index) => /* @__PURE__ */ jsx5(
                "div",
                {
                  className: "group rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-700 dark:bg-zinc-800",
                  children: editingBugfix === index ? /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2", children: [
                    /* @__PURE__ */ jsx5(
                      "input",
                      {
                        type: "text",
                        value: editingBugfixValue,
                        onChange: (e) => setEditingBugfixValue(e.target.value),
                        onKeyDown: (e) => {
                          if (e.key === "Enter") {
                            saveBugfixEdit(index);
                          } else if (e.key === "Escape") {
                            cancelBugfixEdit();
                          }
                        },
                        onBlur: () => saveBugfixEdit(index),
                        className: "flex-1 rounded border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-50",
                        autoFocus: true
                      }
                    ),
                    /* @__PURE__ */ jsx5(
                      "button",
                      {
                        type: "button",
                        onClick: () => saveBugfixEdit(index),
                        className: "rounded p-1 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20",
                        "aria-label": "Save",
                        children: /* @__PURE__ */ jsx5("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M5 13l4 4L19 7" }) })
                      }
                    ),
                    /* @__PURE__ */ jsx5(
                      "button",
                      {
                        type: "button",
                        onClick: cancelBugfixEdit,
                        className: "rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20",
                        "aria-label": "Cancel",
                        children: /* @__PURE__ */ jsx5("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
                      }
                    )
                  ] }) : /* @__PURE__ */ jsxs3("div", { className: "flex items-center justify-between", children: [
                    /* @__PURE__ */ jsx5(
                      "span",
                      {
                        className: "flex-1 cursor-pointer text-sm text-zinc-900 dark:text-zinc-50",
                        onClick: () => startEditingBugfix(index, bugfix),
                        children: bugfix
                      }
                    ),
                    /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100", children: [
                      /* @__PURE__ */ jsx5(
                        "button",
                        {
                          type: "button",
                          onClick: () => startEditingBugfix(index, bugfix),
                          className: "rounded p-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-700",
                          "aria-label": "Edit",
                          children: /* @__PURE__ */ jsx5("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" }) })
                        }
                      ),
                      /* @__PURE__ */ jsx5(
                        "button",
                        {
                          type: "button",
                          onClick: () => removeBugfix(index),
                          className: "rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20",
                          "aria-label": "Remove",
                          children: /* @__PURE__ */ jsx5("svg", { className: "h-4 w-4", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx5("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }) })
                        }
                      )
                    ] })
                  ] })
                },
                index
              )),
              /* @__PURE__ */ jsx5(
                "input",
                {
                  type: "text",
                  id: "bugfixes",
                  value: bugfixInput,
                  onChange: (e) => setBugfixInput(e.target.value),
                  onKeyDown: handleBugfixKeyDown,
                  className: "w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50",
                  placeholder: bugfixes.length === 0 ? "Type a bug fix and press Enter" : "Add another bug fix"
                }
              )
            ] }),
            /* @__PURE__ */ jsx5("p", { className: "mt-1 text-xs text-zinc-500 dark:text-zinc-400", children: "Type a bug fix and press Enter to add it" })
          ] }),
          /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsx5(
              "label",
              {
                htmlFor: "commit",
                className: "mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50",
                children: "Link to Commit"
              }
            ),
            /* @__PURE__ */ jsx5(
              CommitCombobox,
              {
                commits,
                value: selectedCommitHash,
                onValueChange: setSelectedCommitHash,
                isLoading: isLoadingCommits
              }
            ),
            /* @__PURE__ */ jsx5("p", { className: "mt-1 text-xs text-zinc-500 dark:text-zinc-400", children: "Select a commit to link this changelog entry to a specific commit in your repository" })
          ] }),
          /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsxs3(
              "label",
              {
                htmlFor: "body",
                className: "mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50",
                children: [
                  "Body ",
                  /* @__PURE__ */ jsx5("span", { className: "text-red-500", children: "*" })
                ]
              }
            ),
            /* @__PURE__ */ jsx5(Editor, { content: body, onChange: setBody })
          ] }),
          /* @__PURE__ */ jsx5("div", { className: "flex justify-end", children: /* @__PURE__ */ jsx5(
            "button",
            {
              type: "submit",
              disabled: isSaving || !title || !body || !version,
              className: "rounded-lg bg-black px-6 py-2 text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200",
              children: isSaving ? editingSlug ? "Updating..." : "Saving..." : editingSlug ? "Update Changelog Entry" : "Save Changelog Entry"
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs3("div", { className: "lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] lg:overflow-y-auto scrollbar-hide", children: [
        uniqueVersions.length > 0 && /* @__PURE__ */ jsxs3("div", { className: "sticky top-0 z-20 mb-6 space-y-4 bg-zinc-50/95 backdrop-blur-sm pb-6 pt-4 shadow-sm dark:bg-black/95", children: [
          /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsx5("h3", { className: "mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50", children: "Filter by Major Version" }),
            /* @__PURE__ */ jsxs3("div", { className: "flex gap-2 overflow-x-auto scrollbar-hide pb-2", children: [
              /* @__PURE__ */ jsx5(
                "button",
                {
                  onClick: () => {
                    setSelectedMajorVersion(null);
                    setSelectedMinorVersion(null);
                  },
                  className: `shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${selectedMajorVersion === null ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"}`,
                  children: "All Versions"
                }
              ),
              uniqueVersions.map((version2) => {
                return /* @__PURE__ */ jsxs3(
                  "button",
                  {
                    onClick: () => {
                      setSelectedMajorVersion(version2);
                      setSelectedMinorVersion(null);
                    },
                    className: `shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${selectedMajorVersion === version2 ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"}`,
                    children: [
                      "v",
                      version2
                    ]
                  },
                  version2
                );
              })
            ] })
          ] }),
          selectedMajorVersion && minorVersions.length > 0 && /* @__PURE__ */ jsxs3("div", { children: [
            /* @__PURE__ */ jsx5("h3", { className: "mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50", children: "Filter by Minor Version" }),
            /* @__PURE__ */ jsxs3("div", { className: "flex gap-2 overflow-x-auto scrollbar-hide pb-2", children: [
              /* @__PURE__ */ jsxs3(
                "button",
                {
                  onClick: () => setSelectedMinorVersion(null),
                  className: `shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${selectedMinorVersion === null ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"}`,
                  children: [
                    "All ",
                    selectedMajorVersion.split(".")[0],
                    ".x.x"
                  ]
                }
              ),
              minorVersions.map((version2) => {
                return /* @__PURE__ */ jsxs3(
                  "button",
                  {
                    onClick: () => setSelectedMinorVersion(version2),
                    className: `shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${selectedMinorVersion === version2 ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/30 dark:text-blue-300" : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"}`,
                    children: [
                      "v",
                      version2
                    ]
                  },
                  version2
                );
              })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsx5("div", { className: "space-y-8 pt-4", children: filteredEntries.length === 0 ? /* @__PURE__ */ jsx5("div", { className: "rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900", children: /* @__PURE__ */ jsx5("p", { className: "text-sm text-zinc-600 dark:text-zinc-400", children: "No changelog entries yet. Create your first entry!" }) }) : filteredEntries.map((entry, index) => {
          const isLatest = allEntries.length > 0 && entry.slug === allEntries[0].slug;
          const isExpanded = expandedEntries.has(entry.slug);
          const needsTruncation = shouldTruncate(entry);
          const showTruncated = needsTruncation && !isExpanded;
          return /* @__PURE__ */ jsxs3("div", { className: "relative", children: [
            index < filteredEntries.length - 1 && /* @__PURE__ */ jsx5("div", { className: "absolute left-[15px] top-8 h-full w-0.5 bg-zinc-200 dark:bg-zinc-800" }),
            /* @__PURE__ */ jsxs3("div", { className: "relative flex gap-4", children: [
              /* @__PURE__ */ jsx5("div", { className: `relative z-0 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${isLatest ? "border-blue-500 bg-blue-100 dark:border-blue-400 dark:bg-blue-900/30" : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"}`, children: /* @__PURE__ */ jsx5("div", { className: `h-2 w-2 rounded-full ${isLatest ? "bg-blue-600 dark:bg-blue-400" : "bg-zinc-400 dark:bg-zinc-600"}` }) }),
              /* @__PURE__ */ jsxs3("div", { className: "flex-1 space-y-2 pb-8", children: [
                /* @__PURE__ */ jsxs3("div", { className: showTruncated ? "max-h-96 overflow-hidden" : "", children: [
                  /* @__PURE__ */ jsxs3("div", { className: "flex items-center gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsx5("span", { className: "text-xs font-medium text-zinc-500 dark:text-zinc-400", children: formatDate(entry.date) }),
                    entry.updatedAt && /* @__PURE__ */ jsxs3("span", { className: "text-xs font-medium text-zinc-400 dark:text-zinc-500", children: [
                      "Updated ",
                      formatDate(entry.updatedAt)
                    ] }),
                    entry.version && /* @__PURE__ */ jsx5("span", { className: `rounded-full px-2 py-0.5 text-xs font-semibold ${isLatest ? "bg-blue-200 text-blue-900 dark:bg-blue-900/50 dark:text-blue-200" : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"}`, children: entry.version }),
                    entry.commitHash && repoInfo && /* @__PURE__ */ jsxs3(
                      "a",
                      {
                        href: `https://github.com/${repoInfo.owner}/${repoInfo.name}/commit/${entry.commitHash}`,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        className: "text-xs font-medium text-blue-600 hover:text-blue-700 underline dark:text-blue-400 dark:hover:text-blue-300",
                        children: [
                          "View Commit (",
                          entry.commitHash.substring(0, 7),
                          ")"
                        ]
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs3("div", { className: "flex items-start justify-between gap-4", children: [
                    /* @__PURE__ */ jsx5("h3", { className: `flex-1 text-lg font-semibold ${isLatest ? "text-blue-900 dark:text-blue-100" : "text-zinc-900 dark:text-zinc-50"}`, children: entry.title }),
                    /* @__PURE__ */ jsx5(
                      "button",
                      {
                        type: "button",
                        onClick: () => loadEntryForEditing(entry),
                        disabled: editingSlug === entry.slug,
                        className: `flex shrink-0 items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${editingSlug === entry.slug ? "cursor-not-allowed border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-900/20 dark:text-blue-400" : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"}`,
                        title: editingSlug === entry.slug ? "Currently editing this entry" : "Edit this entry",
                        children: editingSlug === entry.slug ? /* @__PURE__ */ jsxs3(Fragment, { children: [
                          /* @__PURE__ */ jsx5(Edit, { className: "h-3 w-3" }),
                          /* @__PURE__ */ jsx5("span", { children: "Editing" }),
                          /* @__PURE__ */ jsxs3("span", { className: "inline-flex", children: [
                            /* @__PURE__ */ jsx5("span", { className: "animate-ellipsis", children: "." }),
                            /* @__PURE__ */ jsx5("span", { className: "animate-ellipsis-delay-1", children: "." }),
                            /* @__PURE__ */ jsx5("span", { className: "animate-ellipsis-delay-2", children: "." })
                          ] })
                        ] }) : /* @__PURE__ */ jsxs3(Fragment, { children: [
                          /* @__PURE__ */ jsx5(Edit, { className: "h-3 w-3" }),
                          "Edit"
                        ] })
                      }
                    )
                  ] }),
                  entry.tags && entry.tags.length > 0 && /* @__PURE__ */ jsx5("div", { className: "flex flex-wrap gap-1.5", children: entry.tags.map((tag, tagIndex) => /* @__PURE__ */ jsx5(
                    "span",
                    {
                      className: "rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
                      children: tag
                    },
                    tagIndex
                  )) }),
                  entry.features && entry.features.length > 0 && /* @__PURE__ */ jsxs3("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsx5("h4", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400", children: "Features" }),
                    /* @__PURE__ */ jsx5("ul", { className: "space-y-1 text-sm text-zinc-700 dark:text-zinc-300", children: entry.features.map((feature, featureIndex) => /* @__PURE__ */ jsxs3("li", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx5("span", { className: "text-2xl leading-none text-green-600 dark:text-green-400", children: "\u2022" }),
                      /* @__PURE__ */ jsx5("span", { children: feature })
                    ] }, featureIndex)) })
                  ] }),
                  entry.bugfixes && entry.bugfixes.length > 0 && /* @__PURE__ */ jsxs3("div", { className: "space-y-1", children: [
                    /* @__PURE__ */ jsx5("h4", { className: "text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400", children: "Bug Fixes" }),
                    /* @__PURE__ */ jsx5("ul", { className: "space-y-1 text-sm text-zinc-700 dark:text-zinc-300", children: entry.bugfixes.map((bugfix, bugfixIndex) => /* @__PURE__ */ jsxs3("li", { className: "flex items-center gap-2", children: [
                      /* @__PURE__ */ jsx5("span", { className: "text-2xl leading-none text-red-600 dark:text-red-400", children: "\u2022" }),
                      /* @__PURE__ */ jsx5("span", { children: bugfix })
                    ] }, bugfixIndex)) })
                  ] }),
                  entry.body && /* @__PURE__ */ jsx5("div", { className: "mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300", children: /* @__PURE__ */ jsx5(
                    ReactMarkdown,
                    {
                      components: {
                        p: ({ children }) => /* @__PURE__ */ jsx5("p", { className: "mb-2", children }),
                        h1: ({ children }) => /* @__PURE__ */ jsx5("h1", { className: "mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50", children }),
                        h2: ({ children }) => /* @__PURE__ */ jsx5("h2", { className: "mb-2 text-base font-semibold text-zinc-900 dark:text-zinc-50", children }),
                        h3: ({ children }) => /* @__PURE__ */ jsx5("h3", { className: "mb-1 text-sm font-semibold text-zinc-900 dark:text-zinc-50", children }),
                        ul: ({ children }) => /* @__PURE__ */ jsx5("ul", { className: "ml-4 list-disc space-y-1", children }),
                        ol: ({ children }) => /* @__PURE__ */ jsx5("ol", { className: "ml-4 list-decimal space-y-1", children }),
                        li: ({ children }) => /* @__PURE__ */ jsx5("li", { children }),
                        strong: ({ children }) => /* @__PURE__ */ jsx5("strong", { className: "font-semibold text-zinc-900 dark:text-zinc-50", children }),
                        em: ({ children }) => /* @__PURE__ */ jsx5("em", { className: "italic", children }),
                        code: ({ children }) => /* @__PURE__ */ jsx5("code", { className: "rounded bg-zinc-100 px-1.5 py-0.5 font-mono text-xs dark:bg-zinc-800", children }),
                        pre: ({ children }) => /* @__PURE__ */ jsx5("pre", { className: "overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-800", children }),
                        a: ({ href, children }) => /* @__PURE__ */ jsx5("a", { href, className: "text-blue-600 underline hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300", children }),
                        blockquote: ({ children }) => /* @__PURE__ */ jsx5("blockquote", { className: "border-l-2 border-zinc-300 pl-3 italic dark:border-zinc-700", children }),
                        img: (props) => {
                          let imageSrc = typeof props.src === "string" ? props.src : "";
                          if (imageSrc.startsWith("chronalog/")) {
                            imageSrc = `/${imageSrc}`;
                          } else if (!imageSrc.startsWith("/") && !imageSrc.startsWith("http")) {
                            imageSrc = `/${imageSrc}`;
                          }
                          return /* @__PURE__ */ jsx5(
                            "img",
                            {
                              ...props,
                              src: imageSrc,
                              alt: props.alt || "",
                              className: "my-4 max-w-full rounded-lg border border-zinc-200 dark:border-zinc-800",
                              onError: (e) => {
                                const target = e.target;
                                target.style.display = "none";
                              }
                            }
                          );
                        }
                      },
                      children: entry.body
                    }
                  ) })
                ] }),
                needsTruncation && /* @__PURE__ */ jsx5(
                  "button",
                  {
                    onClick: () => toggleExpand(entry.slug),
                    className: "mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
                    children: isExpanded ? /* @__PURE__ */ jsxs3(Fragment, { children: [
                      /* @__PURE__ */ jsx5(ChevronUp, { className: "h-3 w-3" }),
                      "Show Less"
                    ] }) : /* @__PURE__ */ jsxs3(Fragment, { children: [
                      /* @__PURE__ */ jsx5(ChevronDown, { className: "h-3 w-3" }),
                      "Show More"
                    ] })
                  }
                )
              ] })
            ] })
          ] }, entry.slug);
        }) })
      ] })
    ] }) })
  ] });
}
export {
  ChangelogAdminPage as default
};
