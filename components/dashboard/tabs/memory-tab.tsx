"use client";

import { useState } from "react";

type MemoryItem = {
  key: string;
  summary: string;
  timestamp: string;
  relevance: number;
};

export const MemoryTab = () => {
  const [query, setQuery] = useState("");
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemory, setNewMemory] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/openclaw/memory?q=${encodeURIComponent(query)}`
      );
      const json = (await res.json()) as MemoryItem[];
      setMemories(json);
    } catch {
      setMemories([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const handleAddMemory = async () => {
    if (!newMemory.trim()) {
      return;
    }
    setSaving(true);
    setSaveResult(null);
    try {
      const res = await fetch("/api/openclaw/memory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newMemory }),
      });
      const json = (await res.json()) as {
        success: boolean;
        response: string;
      };
      setSaveResult(json.response);
      if (json.success) {
        setNewMemory("");
      }
    } catch {
      setSaveResult("Failed to add memory");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Memory Browser</h2>
        <button
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setSaveResult(null);
          }}
          type="button"
        >
          {showAddForm ? "Cancel" : "Add Memory"}
        </button>
      </div>

      {showAddForm ? (
        <div className="space-y-2 rounded-md border border-border/50 p-3">
          <textarea
            className="w-full rounded-md border border-border/50 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            onChange={(e) => {
              setNewMemory(e.target.value);
            }}
            placeholder="Tell the agent what to remember..."
            rows={3}
            value={newMemory}
          />
          <button
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            disabled={saving || !newMemory.trim()}
            onClick={handleAddMemory}
            type="button"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {saveResult ? (
            <p className="text-xs text-muted-foreground">{saveResult}</p>
          ) : null}
        </div>
      ) : null}

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-md border border-border/50 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search agent memory..."
          type="text"
          value={query}
        />
        <button
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          disabled={loading || !query.trim()}
          onClick={handleSearch}
          type="button"
        >
          {loading ? "..." : "Search"}
        </button>
      </div>

      {!searched && memories.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Enter a query to search agent memory
        </p>
      ) : null}

      {searched && memories.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          No memories found
        </p>
      ) : null}

      {memories.length > 0 ? (
        <div className="space-y-2">
          {memories.map((mem) => (
            <button
              className="w-full rounded-md border border-border/30 p-3 text-left transition-colors hover:bg-muted/30"
              key={mem.key}
              onClick={() => {
                setExpandedKey(expandedKey === mem.key ? null : mem.key);
              }}
              type="button"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  {mem.key}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {(mem.relevance * 100).toFixed(0)}% match
                </span>
              </div>
              <p
                className={`mt-1 text-sm ${expandedKey === mem.key ? "" : "line-clamp-2"}`}
              >
                {mem.summary}
              </p>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
