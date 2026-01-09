"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "./utils"
import { Button } from "./button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover"

interface Commit {
  hash: string
  shortHash: string
  message: string
  author: string
  date: string
}

interface CommitComboboxProps {
  commits: Commit[]
  value?: string
  onValueChange: (value: string) => void
  isLoading?: boolean
  disabled?: boolean
}

export function CommitCombobox({
  commits,
  value,
  onValueChange,
  isLoading = false,
  disabled = false,
}: CommitComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const selectedCommit = commits.find((commit) => commit.hash === value)

  // Filter commits based on search
  const filteredCommits = React.useMemo(() => {
    if (!search) return commits
    const searchLower = search.toLowerCase()
    return commits.filter((commit: Commit) => 
      commit.hash.toLowerCase().includes(searchLower) ||
      commit.shortHash.toLowerCase().includes(searchLower) ||
      commit.message.toLowerCase().includes(searchLower) ||
      commit.author.toLowerCase().includes(searchLower)
    )
  }, [commits, search])

  return (
    <Popover open={open} onOpenChange={(newOpen) => {
      setOpen(newOpen)
      if (!newOpen) {
        setSearch("") // Clear search when popover closes
      }
    }}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || isLoading || commits.length === 0}
        >
          {isLoading
            ? "Loading commits..."
            : commits.length === 0
            ? "No commits found"
            : selectedCommit
            ? `${selectedCommit.shortHash} - ${selectedCommit.message}`
            : "Select a commit"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search commits by hash, message, or author..."
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {(isLoading || filteredCommits.length === 0) && (
              <CommandEmpty>
                {isLoading ? "Loading..." : "No commits found."}
              </CommandEmpty>
            )}
            {filteredCommits.map((commit) => {
              const searchValue = `${commit.hash} ${commit.shortHash} ${commit.message} ${commit.author}`
              const handleSelect = () => {
                onValueChange(commit.hash === value ? "" : commit.hash)
                setOpen(false)
              }
              return (
                <div
                  key={commit.hash}
                  role="option"
                  onClick={handleSelect}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      handleSelect()
                    }
                  }}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-zinc-100 hover:text-zinc-900 aria-selected:bg-zinc-100 aria-selected:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50"
                  aria-selected={value === commit.hash}
                  tabIndex={0}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === commit.hash ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1">
                    <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
                      {commit.shortHash}
                    </span>
                    <span className="text-sm">{commit.message}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {commit.author}
                    </span>
                  </div>
                </div>
              )
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
