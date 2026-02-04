import type {
  Icon,
  IconProps as PhosphorIconProps,
} from "@phosphor-icons/react";
import {
  ArrowBendDownLeft,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  BookmarkSimple,
  BookOpen,
  Brain,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  CaretUpDown,
  ChatCircle,
  CheckCircle,
  Circle,
  Clock,
  Image,
  MagnifyingGlass,
  Microphone,
  Paperclip,
  PaperPlaneTilt,
  Check as PhosphorCheck,
  Plus,
  SidebarSimple,
  SpinnerGap,
  Square,
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

// ---------------------------------------------------------------------------
// Exported icons — named to match existing imports for zero consumer changes
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
export {
  WrappedChevronDown as ChevronDown,
  WrappedChevronDown as ChevronDownIcon,
};

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

// Paperclip / Attachment
export const PaperclipIcon = withDefaultSize(Paperclip, "PaperclipIcon");

// Submit / Enter
export const CornerDownLeftIcon = withDefaultSize(
  ArrowBendDownLeft,
  "CornerDownLeftIcon"
);

// Image
export const ImageIcon = withDefaultSize(Image, "ImageIcon");

// Microphone
export const MicIcon = withDefaultSize(Microphone, "MicIcon");

// Plus
export const PlusIcon = withDefaultSize(Plus, "PlusIcon");

// Loader / spinner
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

// Message / Chat
export const MessageCircleIcon = withDefaultSize(
  ChatCircle,
  "MessageCircleIcon"
);
