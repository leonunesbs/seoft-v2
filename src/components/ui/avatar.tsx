/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
"use client";

import * as AvatarPrimitive from "@radix-ui/react-avatar";
import * as React from "react";

import Image from "next/image";
import { cn } from "~/lib/utils";

const Avatar = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className,
    )}
    {...props}
  />
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarFallback = React.forwardRef<
  React.ComponentRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className,
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// Substituí AvatarPrimitive.Image por Image do next/image
const AvatarImage = React.forwardRef<
  React.ComponentRef<typeof Image>,
  React.ComponentPropsWithoutRef<typeof Image>
>(({ className, src, alt, ...props }, ref) => {
  if (!src) return;
  return (
    <Image
      ref={ref}
      src={src}
      alt={alt || "Avatar"}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
      width={40} // Definindo tamanho padrão do avatar (40x40)
      height={40}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

export { Avatar, AvatarFallback, AvatarImage };
