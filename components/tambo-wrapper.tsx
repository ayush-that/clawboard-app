"use client";

import { TamboProvider } from "@tambo-ai/react";
import type { ReactNode } from "react";
import { tamboComponents } from "@/lib/tambo/components";
import { tamboContextHelpers } from "@/lib/tambo/context";
import { tamboTools } from "@/lib/tambo/tools";

export const TamboWrapper = ({
  children,
  apiKey,
}: {
  children: ReactNode;
  apiKey?: string;
}) => (
  <TamboProvider
    apiKey={apiKey || process.env.NEXT_PUBLIC_TAMBO_API_KEY || ""}
    components={tamboComponents}
    contextHelpers={tamboContextHelpers}
    tools={tamboTools}
  >
    {children}
  </TamboProvider>
);
