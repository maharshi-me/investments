import * as React from "react"
import {
  ReceiptText ,
  LayoutList,
  Settings ,
  LayoutDashboard, 
  Github,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "react-router-dom"

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
      <SidebarFooter className="p-0">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="https://github.com/maharshi-me/investments">
                <Github />
                <span>View code on Github</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>

    </Sidebar>
  )
}
