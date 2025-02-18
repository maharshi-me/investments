import * as React from "react"
import {
  ReceiptText ,
  LayoutList,
  Settings ,
  LayoutDashboard ,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: LayoutDashboard
    },
    {
      title: "Portfolio",
      url: "/portfolio",
      icon: LayoutList
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: ReceiptText
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings
    }
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
