import React from "react";
import { AppSidebar, navItems } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Outlet, useLocation } from "react-router-dom";

interface BreadcrumbItemType {
  name: string;
  path: string;
  active: boolean;
}

export default function AdminLayout() {
  const location = useLocation();

  // Get breadcrumb items from current path
  const getBreadcrumbItems = () => {
    const path = location.pathname;

    // Get all path segments
    const segments = path.split("/").filter(Boolean);

    // If no segments, we're at the home/dashboard
    if (segments.length === 0) {
      return [{ name: "Dashboard", path: "/", active: true }];
    }

    // Get the current page from navigation items
    const currentNavItem = navItems.find(
      (item) => item.url.toLowerCase() === `/${segments[0].toLowerCase()}`
    );

    // If we found a matching nav item, use its title
    const pageName =
      currentNavItem?.title ||
      segments[0].charAt(0).toUpperCase() + segments[0].slice(1);

    return [
      { name: "Home", path: "/", active: false },
      { name: pageName, path: `/${segments[0]}`, active: true },
    ];
  };

  const breadcrumbItems: BreadcrumbItemType[] = getBreadcrumbItems();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <React.Fragment key={item.path}>
                    {index > 0 && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                    <BreadcrumbItem className="hidden md:block">
                      {item.active ? (
                        <BreadcrumbPage>{item.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.path}>
                          {item.name}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" /> */}
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
