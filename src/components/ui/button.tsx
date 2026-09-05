import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "button min-h-[44px] inline-flex items-center justify-center rounded-[0.5rem] [border:1px_solid_transparent] p-[0.65rem_1rem] no-underline cursor-pointer",
  {
    variants: {
      variant: {
        default: "button-primary w-fit text-white [background:#10211d]",
        outline: "button-outline bg-white [border-color:#d6dad3] text-[#10211d]",
        ghost: "button-ghost bg-transparent text-[#10211d]",
      },
      size: {
        default: "button-md",
        sm: "button-sm [&&]:min-h-[36px] [&&]:p-[0.4rem_0.7rem]",
        icon: "button-icon [&&]:w-[44px] [&&]:p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  )
);
Button.displayName = "Button";
