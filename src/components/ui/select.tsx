"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "select-trigger min-h-[44px] [border:1px_solid_#d6dad3] rounded-[0.5rem] bg-white text-[#10211d] p-[0.6rem_0.75rem] outline-none [&:focus]:[border-color:#0b6b53] [&:focus]:[box-shadow:0_0_0_3px_rgba(11,_107,_83,_0.15)] inline-flex items-center justify-between gap-3",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown size={16} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          "select-content z-[1200] [border:1px_solid_#d6dad3] rounded-[0.6rem] bg-white p-[0.35rem] [box-shadow:0_12px_35px_rgba(16,_33,_29,_0.14)]",
          className
        )}
        position="popper"
        {...props}
      >
        <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "select-item relative flex gap-2 items-center rounded-[0.35rem] p-[0.55rem_1.8rem_0.55rem_0.6rem] outline-none cursor-pointer [&[data-highlighted]]:[background:#e6f2ed]",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemIndicator>
        <Check size={14} />
      </SelectPrimitive.ItemIndicator>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}
