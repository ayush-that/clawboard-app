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

  const handleSearch = async () => {
    if (!query.trim()) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/openclaw/memory?query=${encodeURIComponent(query)}`
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

  return (
    <div className="space-y-4 p-4">
      <h2 className="text-lg font-semibold">Memory Browser</h2>

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
            <div
              className="rounded-md border border-border/30 p-3"
              key={mem.key}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-medium text-muted-foreground">
                  {mem.key}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {(mem.relevance * 100).toFixed(0)}% match
                </span>
              </div>
              <p className="mt-1 text-sm">{mem.summary}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
