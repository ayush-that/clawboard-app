import type {
  Icon,
  IconProps as PhosphorIconProps,
} from "@phosphor-icons/react";
import {
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowsOut,
  ArrowUp,
  ChartLine,
  ChatCircle,
  CheckCircle,
  ClockCounterClockwise,
  Copy,
  DotsThree,
  File,
  Globe,
  Image,
  ListDashes,
  Lock,
  Paperclip,
  Path,
  Pen,
  PencilSimple,
  ArrowDown as PhosphorArrowDown,
  Play,
  Plus,
  ShareNetwork,
  SidebarSimple,
  Sparkle,
  SpinnerGap,
  Stop,
  Terminal,
  TerminalWindow,
  TextAlignLeft,
  Trash,
  Warning,
  X,
} from "@phosphor-icons/react";

// ---------------------------------------------------------------------------
// Helper — Phosphor defaults to size=256; we want size=16
// ---------------------------------------------------------------------------

const withDefaultSize = (PhosphorIcon: Icon, displayName: string): Icon => {
  const Wrapped = (props: PhosphorIconProps) => (
    <PhosphorIcon size={16} {...props} />
  );
  Wrapped.displayName = displayName;
  return Wrapped as unknown as Icon;
};

const withDefaultSizeAndWeight = (
  PhosphorIcon: Icon,
  weight: PhosphorIconProps["weight"],
  displayName: string
): Icon => {
  const Wrapped = (props: PhosphorIconProps) => (
    <PhosphorIcon size={16} weight={weight} {...props} />
  );
  Wrapped.displayName = displayName;
  return Wrapped as unknown as Icon;
};

// ---------------------------------------------------------------------------
// Phosphor re-exports — same names as before, zero consumer changes
// ---------------------------------------------------------------------------

export const FileIcon = withDefaultSize(File, "FileIcon");
export const LoaderIcon = withDefaultSize(SpinnerGap, "LoaderIcon");
export const PencilEditIcon = withDefaultSize(PencilSimple, "PencilEditIcon");
export const TrashIcon = withDefaultSize(Trash, "TrashIcon");
export const ArrowUpIcon = withDefaultSize(ArrowUp, "ArrowUpIcon");
export const StopIcon = withDefaultSizeAndWeight(Stop, "fill", "StopIcon");
export const PaperclipIcon = withDefaultSize(Paperclip, "PaperclipIcon");
export const MoreHorizontalIcon = withDefaultSize(
  DotsThree,
  "MoreHorizontalIcon"
);
export const MessageIcon = withDefaultSize(ChatCircle, "MessageIcon");
export const CrossIcon = withDefaultSize(X, "CrossIcon");
export const CrossSmallIcon = withDefaultSize(X, "CrossSmallIcon");
export const UndoIcon = withDefaultSize(ArrowCounterClockwise, "UndoIcon");
export const RedoIcon = withDefaultSize(ArrowClockwise, "RedoIcon");
export const ChevronDownIcon = withDefaultSize(
  PhosphorArrowDown,
  "ChevronDownIcon"
);
export const PenIcon = withDefaultSize(Pen, "PenIcon");
export const SummarizeIcon = withDefaultSize(TextAlignLeft, "SummarizeIcon");
export const SidebarLeftIcon = withDefaultSize(
  SidebarSimple,
  "SidebarLeftIcon"
);
export const PlusIcon = withDefaultSize(Plus, "PlusIcon");
export const CopyIcon = withDefaultSize(Copy, "CopyIcon");
export const SparklesIcon = withDefaultSize(Sparkle, "SparklesIcon");
export const CheckCircleFillIcon = withDefaultSizeAndWeight(
  CheckCircle,
  "fill",
  "CheckCircleFillIcon"
);
export const GlobeIcon = withDefaultSize(Globe, "GlobeIcon");
export const LockIcon = withDefaultSize(Lock, "LockIcon");
export const ShareIcon = withDefaultSize(ShareNetwork, "ShareIcon");
export const PlayIcon = withDefaultSizeAndWeight(Play, "fill", "PlayIcon");
export const TerminalWindowIcon = withDefaultSize(
  TerminalWindow,
  "TerminalWindowIcon"
);
export const TerminalIcon = withDefaultSize(Terminal, "TerminalIcon");
export const ClockRewind = withDefaultSize(
  ClockCounterClockwise,
  "ClockRewind"
);
export const LogsIcon = withDefaultSize(ListDashes, "LogsIcon");
export const ImageIcon = withDefaultSize(Image, "ImageIcon");
export const FullscreenIcon = withDefaultSize(ArrowsOut, "FullscreenIcon");
export const LineChartIcon = withDefaultSize(ChartLine, "LineChartIcon");
export const WarningIcon = withDefaultSizeAndWeight(
  Warning,
  "fill",
  "WarningIcon"
);
export const RouteIcon = withDefaultSize(Path, "RouteIcon");
