"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onChange"
> {
  readonly checked: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, className, onCheckedChange, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      role="switch"
      aria-checked={checked}
      className={cn(
        "switch w-[42px] h-[24px] border-0 rounded-[999px] [background:#9ba5a0] p-[3px] cursor-pointer",
        checked &&
          "switch-checked [&&]:[background:#0b6b53] [&_.switch-thumb]:[transform:translateX(18px)]",
        className
      )}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <span
        className={
          "switch-thumb block w-[18px] h-[18px] rounded-[50%] bg-white [transition:transform_0.15s]"
        }
      />
    </button>
  )
);
Switch.displayName = "Switch";
