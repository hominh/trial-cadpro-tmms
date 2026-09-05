"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export function TooltipContent({
  className,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className={cn(
          "tooltip-content [&&]:z-[1200] [&&]:[border:1px_solid_#d6dad3] [&&]:rounded-[0.6rem] [&&]:bg-white [&&]:p-[0.35rem] [&&]:[box-shadow:0_12px_35px_rgba(16,_33,_29,_0.14)] [&&]:p-[0.4rem_0.55rem] [&&]:text-[0.75rem]",
          className
        )}
        sideOffset={6}
        {...props}
      />
    </TooltipPrimitive.Portal>
  );
}
