"use client";

import { TamboProvider } from "@tambo-ai/react";
import { createContext, type ReactNode, useContext } from "react";
import { tamboComponents } from "@/lib/tambo/components";
import { tamboContextHelpers } from "@/lib/tambo/context";
import { tamboTools } from "@/lib/tambo/tools";

type TamboRuntimeContextValue = {
  enabled: boolean;
};

const TamboRuntimeContext = createContext<TamboRuntimeContextValue>({
  enabled: false,
});

export const useTamboRuntime = () => useContext(TamboRuntimeContext);

export const TamboWrapper = ({
  children,
  apiKey,
}: {
  children: ReactNode;
  apiKey?: string;
}) => {
  const resolvedKey = apiKey?.trim() ?? "";
  const enabled = resolvedKey.length > 0;

  if (!enabled) {
    return (
      <TamboRuntimeContext.Provider value={{ enabled: false }}>
        {children}
      </TamboRuntimeContext.Provider>
    );
  }

  return (
    <TamboRuntimeContext.Provider value={{ enabled: true }}>
      <TamboProvider
        apiKey={resolvedKey}
        components={tamboComponents}
        contextHelpers={tamboContextHelpers}
        tools={tamboTools}
      >
        {children}
      </TamboProvider>
    </TamboRuntimeContext.Provider>
  );
};
