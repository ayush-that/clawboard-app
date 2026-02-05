"use client";

import { Children } from "react";
import { InputGroupAddon, InputGroupButton } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import type {
  PromptInputButtonProps,
  PromptInputFooterProps,
  PromptInputHeaderProps,
  PromptInputToolsProps,
} from "./types";

export const PromptInputHeader = ({
  className,
  ...props
}: PromptInputHeaderProps) => (
  <InputGroupAddon
    align="block-end"
    className={cn("flex-wrap order-first gap-1", className)}
    {...props}
  />
);

export const PromptInputFooter = ({
  className,
  ...props
}: PromptInputFooterProps) => (
  <InputGroupAddon
    align="block-end"
    className={cn("gap-1 justify-between", className)}
    {...props}
  />
);

export const PromptInputTools = ({
  className,
  ...props
}: PromptInputToolsProps) => (
  <div className={cn("flex gap-1 items-center", className)} {...props} />
);

export const PromptInputButton = ({
  variant = "ghost",
  className,
  size,
  ...props
}: PromptInputButtonProps) => {
  const newSize =
    size ?? (Children.count(props.children) > 1 ? "sm" : "icon-sm");

  return (
    <InputGroupButton
      className={cn(className)}
      size={newSize}
      type="button"
      variant={variant}
      {...props}
    />
  );
};
