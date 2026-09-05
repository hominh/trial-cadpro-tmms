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
      className={cn("switch", checked && "switch-checked", className)}
      onClick={() => onCheckedChange?.(!checked)}
      {...props}
    >
      <span className="switch-thumb" />
    </button>
  )
);
Switch.displayName = "Switch";
