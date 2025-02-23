import { useLocation, useNavigate } from "react-router-dom"
import { SidebarGroup, useSidebar } from "@/components/ui/sidebar"
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

interface NavItem {
  title: string
  url: string
  icon: React.ComponentType
}

interface NavMainProps {
  items: NavItem[]
}

export function NavMain({ items }: NavMainProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { setOpenMobile, isMobile } = useSidebar()

  const handleNavigation = (url: string) => {
    navigate(url)
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.url}>
          <SidebarMenuButton
            isActive={location.pathname === item.url}
            onClick={() => handleNavigation(item.url)}
          >
            <item.icon />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
