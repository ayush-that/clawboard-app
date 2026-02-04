"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
  const [error, setError] = useState<string | null>(null);
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
      const json = await res.json();
      setMemories(Array.isArray(json) ? json : []);
      setError(null);
    } catch {
      setError("Failed to search memory. Check gateway connection.");
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
    <div className="mx-auto w-full max-w-4xl space-y-4 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Memory Browser</h2>
        <Button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setSaveResult(null);
          }}
          size="sm"
          variant={showAddForm ? "ghost" : "default"}
        >
          {showAddForm ? "Cancel" : "Add Memory"}
        </Button>
      </div>

      {showAddForm ? (
        <Card>
          <CardContent className="space-y-3 p-4">
            <Textarea
              onChange={(e) => {
                setNewMemory(e.target.value);
              }}
              placeholder="Tell the agent what to remember..."
              rows={3}
              value={newMemory}
            />
            <div className="flex items-center gap-3">
              <Button
                disabled={saving || !newMemory.trim()}
                onClick={handleAddMemory}
                size="sm"
              >
                {saving ? "Saving..." : "Save"}
              </Button>
              {saveResult ? (
                <span className="text-xs text-muted-foreground">
                  {saveResult}
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="flex gap-2">
        <Input
          className="flex-1"
          onChange={(e) => {
            setQuery(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search agent memory..."
          value={query}
        />
        <Button
          disabled={loading || !query.trim()}
          onClick={handleSearch}
          size="default"
        >
          {loading ? "..." : "Search"}
        </Button>
      </div>

      {error ? (
        <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <span>{error}</span>
          <Button
            className="ml-4 h-7 px-2.5 text-xs"
            onClick={handleSearch}
            size="sm"
            variant="outline"
          >
            Retry
          </Button>
        </div>
      ) : null}

      {!searched && memories.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              Enter a query to search agent memory
            </p>
          </CardContent>
        </Card>
      ) : null}

      {searched && memories.length === 0 ? (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">No memories found</p>
          </CardContent>
        </Card>
      ) : null}

      {memories.length > 0 ? (
        <div className="space-y-2">
          {memories.map((mem) => (
            <Card
              className="cursor-pointer transition-colors hover:bg-muted/50"
              key={mem.key}
            >
              <button
                className="w-full p-4 text-left"
                onClick={() => {
                  setExpandedKey(expandedKey === mem.key ? null : mem.key);
                }}
                type="button"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    {mem.key}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(mem.relevance * 100).toFixed(0)}% match
                  </span>
                </div>
                <p
                  className={`mt-1.5 text-sm ${expandedKey === mem.key ? "" : "line-clamp-2"}`}
                >
                  {mem.summary}
                </p>
              </button>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
};
