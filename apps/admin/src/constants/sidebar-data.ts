import {
  Fan,
  UsersRound,
  CircleDollarSign,
  Settings,
  NotepadTextDashed,
  UserRoundCog,
  FileText,
  BookType,
  Search,
  TicketPercent,
  LayoutList,
} from "lucide-react";

export const sidebarData = {
  teams: [
    {
      name: "Flowrad AI",
      logo: Fan,
      plan: "Admin",
    },
  ],
  navItemsWithNoSubItems: [
    {
      title: "Users",
      url: "/users",
      icon: UsersRound,
    },
    {
      title: "Payment & Subscription",
      url: "/payment",
      icon: CircleDollarSign,
    },
    {
      title: "Pricing Plans",
      url: "/pricing-plans",
      icon: LayoutList,
    },
    {
      title: "Coupon Code",
      url: "/coupon-code",
      icon: TicketPercent,
    },
    {
      title: "Templates",
      url: "/template",
      icon: NotepadTextDashed,
    },
    {
      title: "LLM Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Web Assist Prompt",
      url: "/web-search-prompt",
      icon: Search,
    },
    {
      title: "Speciality",
      url: "/speciality",
      icon: UserRoundCog,
    },
    {
      title: "Document",
      url: "/document",
      icon: FileText,
    },
    {
      title: "Macros",
      url: "/macros",
      icon: BookType,
    },
  ],
  navItemsWithSubItems: [],
};