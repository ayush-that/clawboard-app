import { memo } from "react";
import type { ChatMessage } from "@/lib/types";
import { Action, Actions } from "./elements/actions";
import { PencilEditIcon } from "./icons";

export function PureMessageActions({
  message,
  isLoading,
  setMode,
}: {
  chatId: string;
  message: ChatMessage;
  isLoading: boolean;
  setMode?: (mode: "view" | "edit") => void;
}) {
  if (isLoading) {
    return null;
  }

  // User messages get edit action on hover
  if (message.role === "user") {
    if (!setMode) {
      return null;
    }
    return (
      <Actions className="-mr-0.5 justify-end">
        <Action
          className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover/message:opacity-100"
          data-testid="message-edit-button"
          onClick={() => setMode("edit")}
          tooltip="Edit"
        >
          <PencilEditIcon />
        </Action>
      </Actions>
    );
  }

  return null;
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) {
      return false;
    }
    return true;
  }
);
