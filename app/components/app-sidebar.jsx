"use client"

import Image from "next/image"
import Link from "next/link"
import {
  BarChart3,
  CheckCircle,
  FileText,
  LayoutDashboard,
  List,
  Megaphone,
  MessageSquare,
  Newspaper,
  Package2,
  ShoppingCart,
  Target,
  TrendingUp,
  Users,
} from "lucide-react"

import { NavMain } from "@/app/components/nav-main"
import { NavUser } from "@/app/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/app/components/ui/sidebar"

function buildSidebarUser(userData = {}) {
  return {
    name: userData.name || userData.first_name || userData.firstName || "Anjani Tek User",
    detail: userData.role || userData.email || userData.phone || "Authenticated user",
    avatar: userData.avatar || userData.photo || "",
  }
}

function getNavigationSections(role) {
  const sections = []

  const overviewItems = []
  const salesItems = [
    { title: "Dealers", href: "/dealers", icon: Users },
    { title: "Targets", href: "/targets", icon: Target },
    { title: "Messages", href: "/messages", icon: MessageSquare },
    { title: "Feed", href: "/feed", icon: Newspaper },
    { title: "Ledger", href: "/ledger", icon: List },
  ]
  const operationsItems = []

  if (role === "SuperAdmin" || role === "SalesManager") {
    overviewItems.push({ title: "Dashboard", href: "/dashboard", icon: LayoutDashboard })
  }

  if (role === "SuperAdmin") {
    salesItems.push({ title: "Sales", href: "/sales", icon: ShoppingCart })
    operationsItems.push(
      { title: "Invoices", href: "/invoices", icon: FileText },
      { title: "Offers", href: "/offers", icon: Megaphone },
      { title: "Confirmations", href: "/confirmations", icon: CheckCircle }
    )
  }

  if (role === "SuperAdmin" || role === "StockAdmin") {
    operationsItems.push(
      { title: "Designs", href: "/productsv2", icon: Package2 },
      { title: "App Reports", href: "/appreports", icon: BarChart3 },
      { title: "Forecast", href: "/forecast", icon: TrendingUp }
    )
  }

  if (overviewItems.length) {
    sections.push({ title: "Overview", items: overviewItems })
  }

  if (salesItems.length) {
    sections.push({ title: "Sales", items: salesItems })
  }

  if (operationsItems.length) {
    sections.push({ title: "Operations", items: operationsItems })
  }

  return sections
}

function getHomeHref(role) {
  if (role === "SuperAdmin" || role === "SalesManager") return "/dashboard"
  return "/dealers"
}

export function AppSidebar({ userData, ...props }) {
  const sidebarUser = buildSidebarUser(userData)
  const sections = getNavigationSections(userData?.role)
  const homeHref = getHomeHref(userData?.role)

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={homeHref}>
                <div className="relative flex size-10 items-center justify-center overflow-hidden rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                  <Image src="/anjani_logo.webp" alt="Anjani Tek" fill className="object-cover" sizes="40px" />
                </div>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-semibold">Anjani Tek</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">Sales workspace</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain sections={sections} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}