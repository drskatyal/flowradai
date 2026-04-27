import { useMemo } from "react";

export const getInitials = (name: string): string => {
  return useMemo(() => {
    return name
      .split(" ")
      .filter((word) => word)
      .map((word) => word[0].toUpperCase())
      .slice(0, 2)
      .join("");
  }, [name]);
};
