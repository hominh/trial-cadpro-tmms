import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "input min-h-[44px] [border:1px_solid_#d6dad3] rounded-[0.5rem] bg-white text-[#10211d] p-[0.6rem_0.75rem] outline-none [&:focus]:[border-color:#0b6b53] [&:focus]:[box-shadow:0_0_0_3px_rgba(11,_107,_83,_0.15)] textarea [&&]:w-full [&&]:min-h-[7rem] [&&]:resize-y [&&]:[font:0.85rem/1.45_ui-monospace,_monospace]",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
