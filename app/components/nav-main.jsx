"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/components/ui/sidebar"
import { cn } from "@/app/lib/utils"

function normalizePath(path = "") {
  if (!path) return ""
  if (path === "/") return "/"
  return path.endsWith("/") ? path.slice(0, -1) : path
}

function isPathActive(pathname, href) {
  if (!href) return false

  const currentPath = normalizePath(pathname)
  const targetPath = normalizePath(href)

  if (!currentPath || !targetPath) return false
  if (targetPath === "/") return currentPath === "/"

  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
}

export function NavMain({ sections }) {
  const pathname = usePathname()

  return sections.map((section) => (
    <SidebarGroup key={section.title}>
      <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {section.items.map((item) => {
            const isActive = isPathActive(pathname, item.href)

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    "data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground",
                    "data-[active=true]:hover:bg-sidebar-primary data-[active=true]:hover:text-sidebar-primary-foreground"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  ))
}