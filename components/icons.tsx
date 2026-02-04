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
  CheckSquare,
  Clock,
  ClockCounterClockwise,
  Code,
  Copy,
  Cpu,
  DotsThree,
  DotsThreeOutline,
  DownloadSimple,
  Eye,
  File,
  Gear,
  Globe,
  House,
  Image,
  Info,
  List,
  ListDashes,
  Lock,
  Microphone,
  NavigationArrow,
  Package,
  Paperclip,
  Path,
  Pen,
  PencilSimple,
  ArrowDown as PhosphorArrowDown,
  Play,
  Plus,
  Receipt,
  Robot,
  ShareNetwork,
  SidebarSimple,
  Sparkle,
  SpinnerGap,
  Square,
  Stop,
  Terminal,
  TerminalWindow,
  TextAlignLeft,
  ThumbsDown,
  ThumbsUp,
  Trash,
  Upload,
  User,
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

export const BotIcon = withDefaultSize(Robot, "BotIcon");
export const UserIcon = withDefaultSize(User, "UserIcon");
export const AttachmentIcon = withDefaultSize(File, "AttachmentIcon");
export const BoxIcon = withDefaultSize(Package, "BoxIcon");
export const HomeIcon = withDefaultSize(House, "HomeIcon");
export const GPSIcon = withDefaultSize(NavigationArrow, "GPSIcon");
export const InvoiceIcon = withDefaultSize(Receipt, "InvoiceIcon");
export const RouteIcon = withDefaultSize(Path, "RouteIcon");
export const FileIcon = withDefaultSize(File, "FileIcon");
export const LoaderIcon = withDefaultSize(SpinnerGap, "LoaderIcon");
export const UploadIcon = withDefaultSize(Upload, "UploadIcon");
export const MenuIcon = withDefaultSize(List, "MenuIcon");
export const PencilEditIcon = withDefaultSize(PencilSimple, "PencilEditIcon");
export const CheckedSquare = withDefaultSizeAndWeight(
  CheckSquare,
  "fill",
  "CheckedSquare"
);
export const UncheckedSquare = withDefaultSize(Square, "UncheckedSquare");
export const MoreIcon = withDefaultSize(DotsThreeOutline, "MoreIcon");
export const TrashIcon = withDefaultSize(Trash, "TrashIcon");
export const InfoIcon = withDefaultSize(Info, "InfoIcon");
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
export const DeltaIcon = withDefaultSize(PhosphorArrowDown, "DeltaIcon");
export const CpuIcon = withDefaultSize(Cpu, "CpuIcon");
export const PenIcon = withDefaultSize(Pen, "PenIcon");
export const SummarizeIcon = withDefaultSize(TextAlignLeft, "SummarizeIcon");
export const SidebarLeftIcon = withDefaultSize(
  SidebarSimple,
  "SidebarLeftIcon"
);
export const PlusIcon = withDefaultSize(Plus, "PlusIcon");
export const CopyIcon = withDefaultSize(Copy, "CopyIcon");
export const ThumbUpIcon = withDefaultSize(ThumbsUp, "ThumbUpIcon");
export const ThumbDownIcon = withDefaultSize(ThumbsDown, "ThumbDownIcon");
export const ChevronDownIcon = withDefaultSize(
  PhosphorArrowDown,
  "ChevronDownIcon"
);
export const SparklesIcon = withDefaultSize(Sparkle, "SparklesIcon");
export const CheckCircleFillIcon = withDefaultSizeAndWeight(
  CheckCircle,
  "fill",
  "CheckCircleFillIcon"
);
export const GlobeIcon = withDefaultSize(Globe, "GlobeIcon");
export const LockIcon = withDefaultSize(Lock, "LockIcon");
export const EyeIcon = withDefaultSize(Eye, "EyeIcon");
export const ShareIcon = withDefaultSize(ShareNetwork, "ShareIcon");
export const CodeIcon = withDefaultSize(Code, "CodeIcon");
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
export const DownloadIcon = withDefaultSize(DownloadSimple, "DownloadIcon");
export const LineChartIcon = withDefaultSize(ChartLine, "LineChartIcon");
export const WarningIcon = withDefaultSizeAndWeight(
  Warning,
  "fill",
  "WarningIcon"
);
export const GearIcon = withDefaultSize(Gear, "GearIcon");
export const MicIcon = withDefaultSize(Microphone, "MicIcon");
export const ClockIcon = withDefaultSize(Clock, "ClockIcon");

// ---------------------------------------------------------------------------
// Brand SVGs — Phosphor doesn't have brand logos, keep inline
// ---------------------------------------------------------------------------

export const VercelIcon = ({ size = 17 }: { size?: number }) => {
  return (
    <svg
      height={size}
      strokeLinejoin="round"
      style={{ color: "currentcolor" }}
      viewBox="0 0 16 16"
      width={size}
    >
      <path
        clipRule="evenodd"
        d="M8 1L16 15H0L8 1Z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export const GitIcon = () => {
  return (
    <svg
      height="16"
      strokeLinejoin="round"
      style={{ color: "currentcolor" }}
      viewBox="0 0 16 16"
      width="16"
    >
      <g clipPath="url(#clip0_872_3147)">
        <path
          clipRule="evenodd"
          d="M8 0C3.58 0 0 3.57879 0 7.99729C0 11.5361 2.29 14.5251 5.47 15.5847C5.87 15.6547 6.02 15.4148 6.02 15.2049C6.02 15.0149 6.01 14.3851 6.01 13.7154C4 14.0852 3.48 13.2255 3.32 12.7757C3.23 12.5458 2.84 11.836 2.5 11.6461C2.22 11.4961 1.82 11.1262 2.49 11.1162C3.12 11.1062 3.57 11.696 3.72 11.936C4.44 13.1455 5.59 12.8057 6.05 12.5957C6.12 12.0759 6.33 11.726 6.56 11.5261C4.78 11.3262 2.92 10.6364 2.92 7.57743C2.92 6.70773 3.23 5.98797 3.74 5.42816C3.66 5.22823 3.38 4.40851 3.82 3.30888C3.82 3.30888 4.49 3.09895 6.02 4.1286C6.66 3.94866 7.34 3.85869 8.02 3.85869C8.7 3.85869 9.38 3.94866 10.02 4.1286C11.55 3.08895 12.22 3.30888 12.22 3.30888C12.66 4.40851 12.38 5.22823 12.3 5.42816C12.81 5.98797 13.12 6.69773 13.12 7.57743C13.12 10.6464 11.25 11.3262 9.47 11.5261C9.76 11.776 10.01 12.2558 10.01 13.0056C10.01 14.0752 10 14.9349 10 15.2049C10 15.4148 10.15 15.6647 10.55 15.5847C12.1381 15.0488 13.5182 14.0284 14.4958 12.6673C15.4735 11.3062 15.9996 9.67293 16 7.99729C16 3.57879 12.42 0 8 0Z"
          fill="currentColor"
          fillRule="evenodd"
        />
      </g>
      <defs>
        <clipPath id="clip0_872_3147">
          <rect fill="white" height="16" width="16" />
        </clipPath>
      </defs>
    </svg>
  );
};

export const LogoOpenAI = ({ size = 16 }: { size?: number }) => {
  return (
    <svg
      height={size}
      strokeLinejoin="round"
      style={{ color: "currentcolor" }}
      viewBox="0 0 16 16"
      width={size}
    >
      <path
        d="M14.9449 6.54871C15.3128 5.45919 15.1861 4.26567 14.5978 3.27464C13.7131 1.75461 11.9345 0.972595 10.1974 1.3406C9.42464 0.481584 8.3144 -0.00692594 7.15045 7.42132e-05C5.37487 -0.00392587 3.79946 1.1241 3.2532 2.79113C2.11256 3.02164 1.12799 3.72615 0.551837 4.72468C-0.339497 6.24071 -0.1363 8.15175 1.05451 9.45178C0.686626 10.5413 0.813308 11.7348 1.40162 12.7258C2.28637 14.2459 4.06498 15.0279 5.80204 14.6599C6.5743 15.5189 7.68504 16.0074 8.849 15.9999C10.6256 16.0044 12.2015 14.8754 12.7478 13.2069C13.8884 12.9764 14.873 12.2718 15.4491 11.2733C16.3394 9.75728 16.1357 7.84774 14.9454 6.54771L14.9449 6.54871ZM8.85001 14.9544C8.13907 14.9554 7.45043 14.7099 6.90468 14.2604C6.92951 14.2474 6.97259 14.2239 7.00046 14.2069L10.2293 12.3668C10.3945 12.2743 10.4959 12.1008 10.4949 11.9133V7.42173L11.8595 8.19925C11.8742 8.20625 11.8838 8.22025 11.8858 8.23625V11.9558C11.8838 13.6099 10.5263 14.9509 8.85001 14.9544ZM2.32133 12.2028C1.9651 11.5958 1.8369 10.8843 1.95902 10.1938C1.98284 10.2078 2.02489 10.2333 2.05479 10.2503L5.28366 12.0903C5.44733 12.1848 5.65003 12.1848 5.81421 12.0903L9.75604 9.84429V11.3993C9.75705 11.4153 9.74945 11.4308 9.73678 11.4408L6.47295 13.3004C5.01915 14.1264 3.1625 13.6354 2.32184 12.2028H2.32133ZM1.47155 5.24819C1.82626 4.64017 2.38619 4.17516 3.05305 3.93366C3.05305 3.96116 3.05152 4.00966 3.05152 4.04366V7.72424C3.05051 7.91124 3.15186 8.08475 3.31654 8.17725L7.25838 10.4228L5.89376 11.2003C5.88008 11.2093 5.86285 11.2108 5.84765 11.2043L2.58331 9.34327C1.13255 8.51426 0.63494 6.68272 1.47104 5.24869L1.47155 5.24819ZM12.6834 7.82274L8.74157 5.57669L10.1062 4.79968C10.1199 4.79068 10.1371 4.78918 10.1523 4.79568L13.4166 6.65522C14.8699 7.48373 15.3681 9.31827 14.5284 10.7523C14.1732 11.3593 13.6138 11.8243 12.9474 12.0663V8.27575C12.9489 8.08875 12.8481 7.91574 12.6839 7.82274H12.6834ZM14.0414 5.8057C14.0176 5.7912 13.9756 5.7662 13.9457 5.7492L10.7168 3.90916C10.5531 3.81466 10.3504 3.81466 10.1863 3.90916L6.24442 6.15521V4.60017C6.2434 4.58417 6.251 4.56867 6.26367 4.55867L9.52751 2.70063C10.9813 1.87311 12.84 2.36563 13.6781 3.80066C14.0323 4.40667 14.1605 5.11618 14.0404 5.8057H14.0414ZM5.50257 8.57726L4.13744 7.79974C4.12275 7.79274 4.11312 7.77874 4.11109 7.76274V4.04316C4.11211 2.38713 5.47368 1.0451 7.15197 1.0461C7.86189 1.0461 8.54902 1.2921 9.09476 1.74011C9.06993 1.75311 9.02737 1.77661 8.99899 1.79361L5.77012 3.63365C5.60493 3.72615 5.50358 3.89916 5.50459 4.08666L5.50257 8.57626V8.57726ZM6.24391 7.00022L7.99972 5.9997L9.75553 6.99972V9.00027L7.99972 10.0003L6.24391 9.00027V7.00022Z"
        fill="currentColor"
      />
    </svg>
  );
};

export const LogoGoogle = ({ size = 16 }: { size?: number }) => {
  return (
    <svg
      data-testid="geist-icon"
      height={size}
      strokeLinejoin="round"
      style={{ color: "currentcolor" }}
      viewBox="0 0 16 16"
      width={size}
    >
      <path
        d="M8.15991 6.54543V9.64362H12.4654C12.2763 10.64 11.709 11.4837 10.8581 12.0509L13.4544 14.0655C14.9671 12.6692 15.8399 10.6182 15.8399 8.18188C15.8399 7.61461 15.789 7.06911 15.6944 6.54552L8.15991 6.54543Z"
        fill="#4285F4"
      />
      <path
        d="M3.6764 9.52268L3.09083 9.97093L1.01807 11.5855C2.33443 14.1963 5.03241 16 8.15966 16C10.3196 16 12.1305 15.2873 13.4542 14.0655L10.8578 12.0509C10.1451 12.5309 9.23598 12.8219 8.15966 12.8219C6.07967 12.8219 4.31245 11.4182 3.67967 9.5273L3.6764 9.52268Z"
        fill="#34A853"
      />
      <path
        d="M1.01803 4.41455C0.472607 5.49087 0.159912 6.70543 0.159912 7.99995C0.159912 9.29447 0.472607 10.509 1.01803 11.5854C1.01803 11.5926 3.6799 9.51991 3.6799 9.51991C3.5199 9.03991 3.42532 8.53085 3.42532 7.99987C3.42532 7.46889 3.5199 6.95983 3.6799 6.47983L1.01803 4.41455Z"
        fill="#FBBC05"
      />
      <path
        d="M8.15982 3.18545C9.33802 3.18545 10.3853 3.59271 11.2216 4.37818L13.5125 2.0873C12.1234 0.792777 10.3199 0 8.15982 0C5.03257 0 2.33443 1.79636 1.01807 4.41455L3.67985 6.48001C4.31254 4.58908 6.07983 3.18545 8.15982 3.18545Z"
        fill="#EA4335"
      />
    </svg>
  );
};

export const LogoAnthropic = () => {
  return (
    <svg
      height="18px"
      style={{ color: "currentcolor", fill: "currentcolor" }}
      viewBox="0 0 92.2 65"
      width="18px"
      x="0px"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      y="0px"
    >
      <path
        d="M66.5,0H52.4l25.7,65h14.1L66.5,0z M25.7,0L0,65h14.4l5.3-13.6h26.9L51.8,65h14.4L40.5,0C40.5,0,25.7,0,25.7,0z
		M24.3,39.3l8.8-22.8l8.8,22.8H24.3z"
      />
    </svg>
  );
};

export const PythonIcon = ({ size = 16 }: { size?: number }) => {
  return (
    <svg
      height={size}
      strokeLinejoin="round"
      style={{ color: "currentcolor" }}
      viewBox="0 0 16 16"
      width={size}
    >
      <path
        d="M7.90474 0.00013087C7.24499 0.00316291 6.61494 0.0588153 6.06057 0.15584C4.42745 0.441207 4.13094 1.0385 4.13094 2.14002V3.59479H7.9902V4.07971H4.13094H2.68259C1.56099 4.07971 0.578874 4.7465 0.271682 6.01496C-0.0826597 7.4689 -0.0983767 8.37619 0.271682 9.89434C0.546012 11.0244 1.20115 11.8296 2.32276 11.8296H3.64966V10.0856C3.64966 8.82574 4.75179 7.71441 6.06057 7.71441H9.91533C10.9884 7.71441 11.845 6.84056 11.845 5.77472V2.14002C11.845 1.10556 10.9626 0.328487 9.91533 0.15584C9.25237 0.046687 8.56448 -0.00290121 7.90474 0.00013087ZM5.81768 1.17017C6.21631 1.17017 6.54185 1.49742 6.54185 1.89978C6.54185 2.30072 6.21631 2.62494 5.81768 2.62494C5.41761 2.62494 5.09351 2.30072 5.09351 1.89978C5.09351 1.49742 5.41761 1.17017 5.81768 1.17017Z"
        fill="currentColor"
      />
      <path
        d="M12.3262 4.07971V5.77472C12.3262 7.08883 11.1997 8.19488 9.91525 8.19488H6.06049C5.0046 8.19488 4.13086 9.0887 4.13086 10.1346V13.7693C4.13086 14.8037 5.04033 15.4122 6.06049 15.709C7.28211 16.0642 8.45359 16.1285 9.91525 15.709C10.8868 15.4307 11.8449 14.8708 11.8449 13.7693V12.3145H7.99012V11.8296H11.8449H13.7745C14.8961 11.8296 15.3141 11.0558 15.7041 9.89434C16.1071 8.69865 16.0899 7.5488 15.7041 6.01495C15.4269 4.91058 14.8975 4.07971 13.7745 4.07971H12.3262ZM10.1581 13.2843C10.5582 13.2843 10.8823 13.6086 10.8823 14.0095C10.8823 14.4119 10.5582 14.7391 10.1581 14.7391C9.7595 14.7391 9.43397 14.4119 9.43397 14.0095C9.43397 13.6086 9.7595 13.2843 10.1581 13.2843Z"
        fill="currentColor"
      />
    </svg>
  );
};
