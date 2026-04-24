"use client"

import { ChevronsUpDown, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import Biscuits from "universal-cookie"

import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/app/components/ui/sidebar"

const biscuits = new Biscuits()

function getInitials(name) {
  return (
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "AT"
  )
}

export function NavUser({ user }) {
  const { isMobile } = useSidebar()
  const router = useRouter()

  const handleLogout = () => {
    biscuits.remove("sc_user_detail", { path: "/" })
    router.replace("/")
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="size-9 rounded-xl">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">{user.name}</span>
                <span className="truncate text-xs text-sidebar-foreground/70">{user.detail}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="text-sm font-semibold">{user.name}</span>
              <span className="text-xs font-normal text-muted-foreground">{user.detail}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}