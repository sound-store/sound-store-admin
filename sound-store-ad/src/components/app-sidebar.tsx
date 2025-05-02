"use client";

import * as React from "react";
import { BookOpen, GalleryVerticalEnd, User } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

export const navItems = [
  {
    title: "Customers",
    url: "/customers",
    icon: User,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: BookOpen,
  },
  {
    title: "Products",
    url: "/products",
    icon: GalleryVerticalEnd,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
