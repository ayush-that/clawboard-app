"use client";

import type { DataUIPart } from "ai";
import type React from "react";
import { createContext, useContext, useState } from "react";
import type { CustomUIDataTypes } from "@/lib/types";

type DataStreamValueContextType = DataUIPart<CustomUIDataTypes>[];

type DataStreamSetterContextType = React.Dispatch<
  React.SetStateAction<DataUIPart<CustomUIDataTypes>[]>
>;

const DataStreamValueContext = createContext<DataStreamValueContextType | null>(
  null
);
const DataStreamSetterContext =
  createContext<DataStreamSetterContextType | null>(null);

export function DataStreamProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dataStream, setDataStream] = useState<DataUIPart<CustomUIDataTypes>[]>(
    []
  );

  return (
    <DataStreamSetterContext.Provider value={setDataStream}>
      <DataStreamValueContext.Provider value={dataStream}>
        {children}
      </DataStreamValueContext.Provider>
    </DataStreamSetterContext.Provider>
  );
}

export function useDataStreamValue() {
  const context = useContext(DataStreamValueContext);
  if (context === null) {
    throw new Error(
      "useDataStreamValue must be used within a DataStreamProvider"
    );
  }
  return context;
}

export function useDataStreamSetter() {
  const context = useContext(DataStreamSetterContext);
  if (!context) {
    throw new Error(
      "useDataStreamSetter must be used within a DataStreamProvider"
    );
  }
  return context;
}

export function useDataStream() {
  const dataStream = useDataStreamValue();
  const setDataStream = useDataStreamSetter();
  return { dataStream, setDataStream };
}
