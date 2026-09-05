"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;
export function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        className={"sheet-overlay fixed [inset:0] z-[1100] [background:rgba(6,_18,_15,_0.28)]"}
      />
      <DialogPrimitive.Content
        className={cn(
          "sheet-content fixed z-[1101] top-[0] right-[0] w-[min(420px,_100vw)] h-screen overflow-auto [background:rgba(255,_255,_252,_0.94)] [border-left:1px_solid_#d6dad3] p-[1.25rem] [box-shadow:-20px_0_50px_rgba(16,_33,_29,_0.12)] [@media(max-width:760px)]:[&&&]:top-[auto] [@media(max-width:760px)]:[&&&]:bottom-[0] [@media(max-width:760px)]:[&&&]:w-full [@media(max-width:760px)]:[&&&]:h-[min(72vh,_620px)] [@media(max-width:760px)]:[&&&]:[border:1px_solid_#d6dad3] [@media(max-width:760px)]:[&&&]:rounded-[1rem_1rem_0_0]",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className={
            "sheet-close absolute top-[0.8rem] right-[0.8rem] w-[44px] h-[44px] grid place-items-center border-0 bg-transparent cursor-pointer"
          }
          aria-label="Đóng"
        >
          <X size={18} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}
export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("sheet-header pr-[3rem]", className)} {...props} />;
}
export function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title className={cn("sheet-title m-0 text-[1.4rem]", className)} {...props} />
  );
}
export function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("sheet-description text-[#5b6b65]", className)}
      {...props}
    />
  );
}
