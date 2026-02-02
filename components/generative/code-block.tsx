"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-mono text-sm">
            {filename ?? "Code"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="font-mono text-xs" variant="secondary">
              {language}
            </Badge>
            <button
              className="rounded-md px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              onClick={handleCopy}
              type="button"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <pre className="overflow-x-auto rounded-lg bg-background/80 p-4 font-mono text-sm leading-relaxed">
          <code>{code}</code>
        </pre>
      </CardContent>
    </Card>
  );
};
