import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div role="alert" className={cn("alert", className)} {...props} />; }
export function AlertTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) { return <h3 className={cn("alert-title", className)} {...props} />; }
export function AlertDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) { return <p className={cn("alert-description", className)} {...props} />; }
