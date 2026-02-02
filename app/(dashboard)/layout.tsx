import { TamboWrapper } from "@/components/tambo-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TamboWrapper>{children}</TamboWrapper>;
}
