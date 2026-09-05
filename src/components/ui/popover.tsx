"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export function PopoverContent({
  className,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        className={cn(
          "popover-content z-[1200] [border:1px_solid_#d6dad3] rounded-[0.6rem] bg-white p-[0.35rem] [box-shadow:0_12px_35px_rgba(16,_33,_29,_0.14)]",
          className
        )}
        sideOffset={8}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
