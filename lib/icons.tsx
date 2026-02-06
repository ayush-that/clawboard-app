import type {
  Icon,
  IconProps as PhosphorIconProps,
} from "@phosphor-icons/react";
import {
  ArrowBendDownLeft,
  ArrowClockwise,
  ArrowCounterClockwise,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  ArrowsOut,
  ArrowUp,
  BookmarkSimple,
  BookOpen,
  Brain,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  CaretUpDown,
  ChartLine,
  ChatCircle,
  CheckCircle,
  Circle,
  Clock,
  ClockCounterClockwise,
  Copy,
  DotsThree,
  File,
  Globe,
  Image,
  ListDashes,
  Lock,
  MagnifyingGlass,
  Microphone,
  Paperclip,
  PaperPlaneTilt,
  Path,
  Pen,
  PencilSimple,
  Check as PhosphorCheck,
  Play,
  Plus,
  ShareNetwork,
  SidebarSimple,
  Sparkle,
  SpinnerGap,
  Square,
  Stop,
  Terminal,
  TerminalWindow,
  TextAlignLeft,
  Trash,
  Warning,
  Wrench,
  X,
  XCircle,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";

// ---------------------------------------------------------------------------
// Types — drop-in replacements for LucideIcon / LucideProps
// ---------------------------------------------------------------------------

/** Replace `LucideIcon` with this type for icon-as-prop patterns */
export type IconComponent = ComponentType<PhosphorIconProps>;

/** Replace `LucideProps` with this type */
export type IconProps = PhosphorIconProps;

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
// From components/icons.tsx — application-level icons
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
export const ChevronDownIcon = withDefaultSize(CaretDown, "ChevronDownIcon");
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

// ---------------------------------------------------------------------------
// From lib/hugeicons.tsx — UI-level icons
// ---------------------------------------------------------------------------

// Close / dismiss
const WrappedX = withDefaultSize(X, "X");
export { WrappedX as X, WrappedX as XIcon };

// Search
const WrappedSearch = withDefaultSize(MagnifyingGlass, "Search");
export { WrappedSearch as Search, WrappedSearch as SearchIcon };

// Sidebar toggle
export const PanelLeft = withDefaultSize(SidebarSimple, "PanelLeft");

// Checkmark
export const Check = withDefaultSize(PhosphorCheck, "Check");

// Chevrons
const WrappedChevronRight = withDefaultSize(CaretRight, "ChevronRight");
export {
  WrappedChevronRight as ChevronRight,
  WrappedChevronRight as ChevronRightIcon,
};

const WrappedChevronDown = withDefaultSize(CaretDown, "ChevronDown");
export { WrappedChevronDown as ChevronDown };

export const ChevronUp = withDefaultSize(CaretUp, "ChevronUp");
export const ChevronLeft = withDefaultSize(CaretLeft, "ChevronLeft");
export { ChevronLeft as ChevronLeftIcon };

const WrappedChevronsUpDown = withDefaultSize(CaretUpDown, "ChevronsUpDown");
export {
  WrappedChevronsUpDown as ChevronsUpDown,
  WrappedChevronsUpDown as ChevronsUpDownIcon,
};

// Circle
const WrappedCircle = withDefaultSize(Circle, "Circle");
export { WrappedCircle as Circle, WrappedCircle as CircleIcon };

// Full arrows
const WrappedArrowLeft = withDefaultSize(ArrowLeft, "ArrowLeft");
export { WrappedArrowLeft as ArrowLeft, WrappedArrowLeft as ArrowLeftIcon };

const WrappedArrowRight = withDefaultSize(ArrowRight, "ArrowRight");
export { WrappedArrowRight as ArrowRight, WrappedArrowRight as ArrowRightIcon };

const WrappedArrowDown = withDefaultSize(ArrowDown, "ArrowDown");
export { WrappedArrowDown as ArrowDown, WrappedArrowDown as ArrowDownIcon };

// Brain
export const BrainIcon = withDefaultSize(Brain, "BrainIcon");

// Book
export const BookIcon = withDefaultSize(BookOpen, "BookIcon");

// Clock
export const ClockIcon = withDefaultSize(Clock, "ClockIcon");

// Wrench
export const WrenchIcon = withDefaultSize(Wrench, "WrenchIcon");

// Status circles
export const CheckCircleIcon = withDefaultSize(CheckCircle, "CheckCircleIcon");
export const XCircleIcon = withDefaultSize(XCircle, "XCircleIcon");

// Bookmark
export const BookmarkIcon = withDefaultSize(BookmarkSimple, "BookmarkIcon");

// Dot — filled circle
const DotComponent = (props: PhosphorIconProps) => (
  <Circle size={16} weight="fill" {...props} />
);
DotComponent.displayName = "DotIcon";
export const DotIcon = DotComponent as unknown as Icon;

// Submit / Enter
export const CornerDownLeftIcon = withDefaultSize(
  ArrowBendDownLeft,
  "CornerDownLeftIcon"
);

// Microphone
export const MicIcon = withDefaultSize(Microphone, "MicIcon");

// Loader / spinner (alias)
export const Loader2Icon = withDefaultSize(SpinnerGap, "Loader2Icon");

// Square / Stop
export const SquareIcon = withDefaultSize(Square, "SquareIcon");

// Send
export const SendIcon = withDefaultSize(PaperPlaneTilt, "SendIcon");

// External link
export const ExternalLinkIcon = withDefaultSize(
  ArrowSquareOut,
  "ExternalLinkIcon"
);

// Message / Chat (alias)
export const MessageCircleIcon = withDefaultSize(
  ChatCircle,
  "MessageCircleIcon"
);
