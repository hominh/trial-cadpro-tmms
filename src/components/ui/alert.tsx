import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="alert"
      className={cn(
        "alert [border:1px_solid_#efc9c5] rounded-[0.6rem] [background:#fff7f6] p-[0.8rem]",
        className
      )}
      {...props}
    />
  );
}
export function AlertTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("alert-title m-[0_0_0.2rem] text-[0.9rem]", className)} {...props} />;
}
export function AlertDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("alert-description m-0 text-[#5b6b65] text-[0.82rem]", className)}
      {...props}
    />
  );
}
