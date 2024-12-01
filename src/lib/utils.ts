import { type ClassValue, clsx as clsxHelper } from "clsx";

import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsxHelper(...inputs));
}
