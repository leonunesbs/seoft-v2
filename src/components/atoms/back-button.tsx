"use client";

import { useRouter } from "next/navigation";
import { type HTMLAttributes } from "react";
import { MdOutlineChevronLeft } from "react-icons/md";

import { Button } from "~/components/ui/button";

type BackButtonProps = HTMLAttributes<HTMLButtonElement>;

export function BackButton({ ...rest }: BackButtonProps) {
  const router = useRouter();

  const handleNavigation = () => {
    router.back(); // Navigate back
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
