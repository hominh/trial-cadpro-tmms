"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;
export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={"dialog-overlay fixed [inset:0] z-[2000] [background:rgba(4,_17,_13,_0.35)]"}
      />
      <DialogPrimitive.Content
        className={cn(
          "dialog-content fixed z-[2001] top-[50%] left-[50%] w-[min(680px,_calc(100vw_-_2rem))] max-h-[min(85vh,_850px)] overflow-auto [transform:translate(-50%,_-50%)] [border:1px_solid_#d6dad3] rounded-[0.8rem] [background:rgba(255,_255,_252,_0.94)] p-[1.25rem] [box-shadow:0_20px_65px_rgba(16,_33,_29,_0.24)]",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
