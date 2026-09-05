"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextValue {
  value: string;
  setValue: (value: string) => void;
}
const TabsContext = React.createContext<TabsContextValue | null>(null);
export function Tabs({
  defaultValue,
  children,
}: {
  readonly defaultValue: string;
  readonly children: React.ReactNode;
}) {
  const [value, setValue] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}
export function TabsList({ children }: { readonly children: React.ReactNode }) {
  return (
    <div
      className={"tabs-list flex gap-[0.3rem] overflow-x-auto [border-bottom:1px_solid_#d6dad3]"}
      role="tablist"
    >
      {children}
    </div>
  );
}
export function TabsTrigger({
  value,
  children,
}: {
  readonly value: string;
  readonly children: React.ReactNode;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be inside Tabs");
  return (
    <button
      type="button"
      role="tab"
      aria-selected={ctx.value === value}
      className={cn(
        "tabs-trigger border-0 [border-bottom:2px_solid_transparent] bg-transparent p-[0.6rem_0.45rem] text-[#5b6b65] cursor-pointer",
        ctx.value === value &&
          "tabs-trigger-active [&&]:[border-color:#0b6b53] [&&]:text-[#10211d] [&&]:font-bold"
      )}
      onClick={() => ctx.setValue(value)}
    >
      {children}
    </button>
  );
}
export function TabsContent({
  value,
  children,
}: {
  readonly value: string;
  readonly children: React.ReactNode;
}) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be inside Tabs");
  return ctx.value === value ? (
    <div role="tabpanel" className={"tabs-content pt-[1rem]"}>
      {children}
    </div>
  ) : null;
}
