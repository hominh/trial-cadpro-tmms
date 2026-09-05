import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "skeleton min-h-[1rem] [background:linear-gradient(90deg,_#e8e8e3_25%,_#f6f6f2_50%,_#e8e8e3_75%)] [background-size:200%_100%] animate-shimmer motion-reduce:[&&&]:[animation-duration:3s]",
        className
      )}
      {...props}
    />
  );
}
