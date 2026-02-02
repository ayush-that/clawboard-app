"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

type CodeBlockProps = {
  code: string;
  language: string;
  filename?: string;
  description?: string;
};

export const CodeBlock = ({
  code,
  language,
  filename,
  description,
}: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <Card className="w-full border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between px-3 py-1.5">
        <span className="font-mono text-xs text-muted-foreground">
          {filename ?? language}
        </span>
        <button
          className="rounded px-1.5 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={handleCopy}
          type="button"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      {description ? (
        <p className="px-3 pb-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
      <CardContent className="p-0">
        <pre className="overflow-x-auto rounded-lg bg-background/80 p-4 font-mono text-sm leading-relaxed">
          <code>{code}</code>
        </pre>
      </CardContent>
    </Card>
  );
};
