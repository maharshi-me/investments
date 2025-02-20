import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useLocation } from "react-router-dom"
import { Loader2Icon } from "lucide-react"


export default function BaseLayout({
  children,
  isLoading,
}: Readonly<{
  children: React.ReactNode;
  isLoading: boolean;
}>) {
  const location = useLocation()

  const getPageTitle = (path: string) => {
    switch (path) {
      case '/':
        return 'Dashboard'
      case '/settings':
        return 'Settings'
      case '/transactions':
        return 'Transactions'
      case '/portfolio':
      return 'Portfolio'
      default:
        return 'Dashboard'
    }
  }

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
                <BreadcrumbItem>
                  <BreadcrumbPage>{getPageTitle(location.pathname)}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        {isLoading ? (
          <div className="flex h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2Icon className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading NAV data...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </SidebarInset>
    </SidebarProvider>
  )
}
