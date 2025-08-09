import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { createHash } from "crypto";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getUserHash(email?: string) {
    return email ? createHash("sha256").update(email).digest("hex").slice(0, 10) : "default";
}