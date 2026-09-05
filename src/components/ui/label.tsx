import * as React from "react";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("form-label block mb-[0.35rem] text-[0.8rem] font-bold", className)}
    {...props}
  />
));
Label.displayName = "Label";
