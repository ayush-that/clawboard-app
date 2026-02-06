"use client";

import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { HoverCardTrigger } from "@/components/ui/hover-card";
import { ImageIcon, PaperclipIcon, XIcon } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { usePromptInputAttachments } from "./context";
import {
  PromptInputHoverCard,
  PromptInputHoverCardContent,
} from "./hover-card";
import type {
  PromptInputActionAddAttachmentsProps,
  PromptInputAttachmentProps,
  PromptInputAttachmentsProps,
} from "./types";

export function PromptInputAttachment({
  data,
  className,
  ...props
}: PromptInputAttachmentProps) {
  const attachments = usePromptInputAttachments();

  const filename = data.filename || "";

  const mediaType =
    data.mediaType?.startsWith("image/") && data.url ? "image" : "file";
  const isImage = mediaType === "image";

  const attachmentLabel = filename || (isImage ? "Image" : "Attachment");

  return (
    <PromptInputHoverCard>
      <HoverCardTrigger asChild>
        <div
          className={cn(
            "group relative flex h-8 cursor-pointer select-none items-center gap-1.5 rounded-md border border-border px-1.5 font-medium text-sm transition-all hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
            className
          )}
          key={data.id}
          {...props}
        >
          <div className="relative size-5 shrink-0">
            <div className="flex overflow-hidden absolute inset-0 justify-center items-center rounded transition-opacity size-5 bg-background group-hover:opacity-0">
              {isImage ? (
                /* biome-ignore lint/performance/noImgElement: dynamic user uploads */
                <img
                  alt={filename || "attachment"}
                  className="object-cover size-5"
                  height={20}
                  src={data.url}
                  width={20}
                />
              ) : (
                <div className="flex justify-center items-center size-5 text-muted-foreground">
                  <PaperclipIcon className="size-3" />
                </div>
              )}
            </div>
            <Button
              aria-label="Remove attachment"
              className="absolute inset-0 size-5 cursor-pointer rounded p-0 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100 [&>svg]:size-2.5"
              onClick={(e) => {
                e.stopPropagation();
                attachments.remove(data.id);
              }}
              type="button"
              variant="ghost"
            >
              <XIcon />
              <span className="sr-only">Remove</span>
            </Button>
          </div>

          <span className="flex-1 truncate">{attachmentLabel}</span>
        </div>
      </HoverCardTrigger>
      <PromptInputHoverCardContent className="p-2 w-auto">
        <div className="space-y-3 w-auto">
          {isImage && (
            <div className="flex overflow-hidden justify-center items-center w-96 max-h-96 rounded-md border">
              {/* biome-ignore lint/performance/noImgElement: dynamic user uploads */}
              <img
                alt={filename || "attachment preview"}
                className="object-contain max-w-full max-h-full"
                height={384}
                src={data.url}
                width={448}
              />
            </div>
          )}
          <div className="flex items-center gap-2.5">
            <div className="min-w-0 flex-1 space-y-1 px-0.5">
              <h4 className="text-sm font-semibold leading-none truncate">
                {filename || (isImage ? "Image" : "Attachment")}
              </h4>
              {data.mediaType && (
                <p className="font-mono text-xs truncate text-muted-foreground">
                  {data.mediaType}
                </p>
              )}
            </div>
          </div>
        </div>
      </PromptInputHoverCardContent>
    </PromptInputHoverCard>
  );
}

export function PromptInputAttachments({
  children,
  className,
  ...props
}: PromptInputAttachmentsProps) {
  const attachments = usePromptInputAttachments();

  if (!attachments.files.length) {
    return null;
  }

  return (
    <div
      className={cn("flex flex-wrap gap-2 items-center p-3 w-full", className)}
      {...props}
    >
      {attachments.files.map((file) => (
        <Fragment key={file.id}>{children(file)}</Fragment>
      ))}
    </div>
  );
}

export const PromptInputActionAddAttachments = ({
  label = "Add photos or files",
  ...props
}: PromptInputActionAddAttachmentsProps) => {
  const attachments = usePromptInputAttachments();

  return (
    <DropdownMenuItem
      {...props}
      onSelect={(e) => {
        e.preventDefault();
        attachments.openFileDialog();
      }}
    >
      <ImageIcon className="mr-2 size-4" /> {label}
    </DropdownMenuItem>
  );
};
