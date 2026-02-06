"use client";

import dynamic from "next/dynamic";
import { createContext, type ReactNode, useContext, useMemo } from "react";
import { tamboComponents } from "@/lib/tambo/components";
import { tamboContextHelpers } from "@/lib/tambo/context";
import { tamboTools } from "@/lib/tambo/tools";

const LazyTamboProvider = dynamic(
  () => import("@tambo-ai/react").then((m) => ({ default: m.TamboProvider })),
  { ssr: false }
);

type TamboRuntimeContextValue = {
  enabled: boolean;
};

const TamboRuntimeContext = createContext<TamboRuntimeContextValue>({
  enabled: false,
});

export const useTamboRuntime = () => useContext(TamboRuntimeContext);

const DISABLED_VALUE: TamboRuntimeContextValue = { enabled: false };
const ENABLED_VALUE: TamboRuntimeContextValue = { enabled: true };

export const TamboWrapper = ({
  children,
  apiKey,
}: {
  children: ReactNode;
  apiKey?: string;
}) => {
  const resolvedKey = apiKey?.trim() ?? "";
  const enabled = resolvedKey.length > 0;
  const contextValue = useMemo(
    () => (enabled ? ENABLED_VALUE : DISABLED_VALUE),
    [enabled]
  );

  if (!enabled) {
    return (
      <TamboRuntimeContext.Provider value={contextValue}>
        {children}
      </TamboRuntimeContext.Provider>
    );
  }

  return (
    <TamboRuntimeContext.Provider value={contextValue}>
      <LazyTamboProvider
        apiKey={resolvedKey}
        components={tamboComponents}
        contextHelpers={tamboContextHelpers}
        tools={tamboTools}
      >
        {children}
      </LazyTamboProvider>
    </TamboRuntimeContext.Provider>
  );
};
