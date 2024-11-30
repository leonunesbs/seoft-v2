"use client";

import { useRouter } from "next/navigation";
import { type HTMLAttributes } from "react";
import { MdOutlineChevronLeft } from "react-icons/md";

import { Button } from "~/components/ui/button";

interface BackButtonProps extends HTMLAttributes<HTMLButtonElement> {
  path?: string; // Optional custom path
}

export function BackButton({ path, ...rest }: BackButtonProps) {
  const router = useRouter();

  const handleNavigation = () => {
    if (path) {
      router.push(path); // Navigate to the custom path
    } else {
      router.back(); // Navigate back
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="-ml-1 mr-1 h-8 w-8"
      onClick={handleNavigation}
      {...rest}
    >
      <MdOutlineChevronLeft size={10} />
    </Button>
  );
}
