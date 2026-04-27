import { format } from "date-fns";

export const formatDate = (date: string | number | Date) => {
  return format(new Date(date), "MMM d, yyyy h:mm a");
};
