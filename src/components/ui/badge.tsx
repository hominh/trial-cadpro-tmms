import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "badge inline-flex items-center rounded-[999px] p-[0.2rem_0.5rem] [background:#e9ece8] text-[0.72rem] font-bold",
        className
      )}
      {...props}
    />
  );
}
