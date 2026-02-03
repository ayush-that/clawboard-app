// Icon data imports from hugeicons free icons
import {
  Add01Icon,
  ArrowDown01Icon,
  ArrowDown02Icon,
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowTurnBackwardIcon,
  ArrowUp01Icon,
  Attachment01Icon,
  Book02Icon,
  Bookmark01Icon,
  BrainIcon as BrainIconData,
  Cancel01Icon,
  CancelCircleIcon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Comment01Icon,
  Image01Icon,
  LinkSquare02Icon,
  Loading03Icon,
  Mic01Icon,
  RecordIcon,
  Search01Icon,
  SentIcon as SentIconData,
  SidebarLeftIcon,
  StopIcon as StopIconData,
  Tick02Icon,
  UnfoldMoreIcon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import type { ComponentProps } from "react";

// ---------------------------------------------------------------------------
// Types — drop-in replacements for LucideIcon / LucideProps
// ---------------------------------------------------------------------------

type HugeIconWrapperProps = Omit<ComponentProps<typeof HugeiconsIcon>, "icon">;

/** Replace `LucideIcon` with this type for icon-as-prop patterns */
export type IconComponent = (props: HugeIconWrapperProps) => React.JSX.Element;

/** Replace `LucideProps` with this type */
export type IconProps = HugeIconWrapperProps;

// ---------------------------------------------------------------------------
// Factory — wraps hugeicon data into a component with the same API as Lucide
// ---------------------------------------------------------------------------

const createIcon = (
  iconData: ComponentProps<typeof HugeiconsIcon>["icon"],
  displayName: string
): IconComponent => {
  const Icon = (props: HugeIconWrapperProps) => (
    <HugeiconsIcon icon={iconData} {...props} />
  );
  Icon.displayName = displayName;
  return Icon;
};

// ---------------------------------------------------------------------------
// Exported icons — named to match Lucide imports for minimal diff
// ---------------------------------------------------------------------------

// Close / dismiss
export const X = createIcon(Cancel01Icon, "X");
export const XIcon = X;

// Search
export const Search = createIcon(Search01Icon, "Search");
export const SearchIcon = Search;

// Sidebar toggle
export const PanelLeft = createIcon(SidebarLeftIcon, "PanelLeft");

// Checkmark
export const Check = createIcon(Tick02Icon, "Check");

// Chevrons → Arrows
export const ChevronRight = createIcon(ArrowRight01Icon, "ChevronRight");
export const ChevronRightIcon = ChevronRight;
export const ChevronDown = createIcon(ArrowDown01Icon, "ChevronDown");
export const ChevronDownIcon = ChevronDown;
export const ChevronUp = createIcon(ArrowUp01Icon, "ChevronUp");
export const ChevronLeft = createIcon(ArrowLeft01Icon, "ChevronLeft");
export const ChevronLeftIcon = ChevronLeft;
export const ChevronsUpDown = createIcon(UnfoldMoreIcon, "ChevronsUpDown");
export const ChevronsUpDownIcon = ChevronsUpDown;

// Circle
export const Circle = createIcon(RecordIcon, "Circle");
export const CircleIcon = Circle;

// Full arrows
export const ArrowLeft = createIcon(ArrowLeft02Icon, "ArrowLeft");
export const ArrowLeftIcon = ArrowLeft;
export const ArrowRight = createIcon(ArrowRight02Icon, "ArrowRight");
export const ArrowRightIcon = ArrowRight;
export const ArrowDown = createIcon(ArrowDown02Icon, "ArrowDown");
export const ArrowDownIcon = ArrowDown;

// Brain
export const BrainIcon = createIcon(BrainIconData, "BrainIcon");

// Book
export const BookIcon = createIcon(Book02Icon, "BookIcon");

// Clock
export const ClockIcon = createIcon(Clock01Icon, "ClockIcon");

// Wrench
export const WrenchIcon = createIcon(Wrench01Icon, "WrenchIcon");

// Status circles
export const CheckCircleIcon = createIcon(
  CheckmarkCircle02Icon,
  "CheckCircleIcon"
);
export const XCircleIcon = createIcon(CancelCircleIcon, "XCircleIcon");

// Bookmark
export const BookmarkIcon = createIcon(Bookmark01Icon, "BookmarkIcon");

// Dot
export const DotIcon = createIcon(RecordIcon, "DotIcon");

// Paperclip / Attachment
export const PaperclipIcon = createIcon(Attachment01Icon, "PaperclipIcon");

// Submit / Enter
export const CornerDownLeftIcon = createIcon(
  ArrowTurnBackwardIcon,
  "CornerDownLeftIcon"
);

// Image
export const ImageIcon = createIcon(Image01Icon, "ImageIcon");

// Microphone
export const MicIcon = createIcon(Mic01Icon, "MicIcon");

// Plus
export const PlusIcon = createIcon(Add01Icon, "PlusIcon");

// Loader / spinner
export const Loader2Icon = createIcon(Loading03Icon, "Loader2Icon");

// Square / Stop
export const SquareIcon = createIcon(StopIconData, "SquareIcon");

// Send
export const SendIcon = createIcon(SentIconData, "SendIcon");

// External link
export const ExternalLinkIcon = createIcon(
  LinkSquare02Icon,
  "ExternalLinkIcon"
);

// Message / Chat
export const MessageCircleIcon = createIcon(Comment01Icon, "MessageCircleIcon");
