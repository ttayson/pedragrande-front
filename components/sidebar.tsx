"use client";

import type React from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "./sidebar-provider";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  HelpCircle,
  LogOut,
  Menu,
  ChevronDown,
  ChevronRight,
  CreditCard,
  UserCircle,
  Building,
  Settings,
  Home,
  Hotel,
  BedDouble,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import type { NavItem, MenuWithSubmenu } from "@/lib/auth/permissions";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, toggle } = useSidebar();
  const [hospedagemOpen, setHospedagemOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const { user, logout } = useAuth();

  // Função para lidar com o logout
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    router.push("/login");
  };

  // Itens de navegação principal com controle de acesso
  const navItems: NavItem[] = [
    {
      name: "Painel",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "user", "gerente"],
    },
    {
      name: "Reservas",
      href: "/reservas",
      icon: Calendar,
      roles: ["admin", "user", "gerente"],
    },
    {
      name: "Check-in",
      href: "/check-in",
      icon: Calendar,
      roles: ["admin", "user", "gerente"],
    },
    {
      name: "Ocupação",
      href: "/ocupacao",
      icon: Home,
      roles: ["admin", "gerente", "user"],
    },
    {
      name: "Pagamentos",
      href: "/pagamentos",
      icon: CreditCard,
      roles: ["admin", "gerente"],
    },
    {
      name: "Clientes",
      href: "/clientes",
      icon: UserCircle,
      roles: ["admin", "gerente"],
    },
    {
      name: "Usuários",
      href: "/users",
      icon: Users,
      badge: "8",
      roles: ["admin", "gerente"],
    },
  ];

  // Menus com submenu e controle de acesso
  const menuWithSubmenu: MenuWithSubmenu[] = [
    {
      name: "Hospedagem",
      icon: Building,
      roles: ["admin", "gerente"],
      submenu: [
        {
          name: "Estabelecimentos",
          href: "/hospedagem/estabelecimentos",
          roles: ["admin", "gerente"],
        },
        {
          name: "Acomodações",
          href: "/hospedagem/acomodacoes",
          roles: ["admin", "gerente"],
        },
        {
          name: "Tipos de Acomodação",
          href: "/hospedagem/tipos",
          roles: ["admin", "gerente"],
        },
        {
          name: "Adicionais",
          href: "/hospedagem/adicionais",
          roles: ["admin", "gerente"],
        },
      ],
    },
    {
      name: "Configurações",
      icon: Settings,
      roles: ["admin"],
      submenu: [
        { name: "Geral", href: "/settings/geral", roles: ["admin"] },
        {
          name: "Integrações",
          href: "/settings/integracoes",
          roles: ["admin"],
        },
        { name: "Backup", href: "/settings/backup", roles: ["admin"] },
      ],
    },
  ];

  // Filtrar itens de navegação com base na função do usuário
  const filteredNavItems = navItems.filter(
    (item) => user && item.roles.includes(user.role as any)
  );

  // Filtrar menus com submenu com base na função do usuário
  const filteredMenuWithSubmenu = menuWithSubmenu.filter(
    (menu) => user && menu.roles.includes(user.role as any)
  );

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden",
          isOpen ? "block" : "hidden"
        )}
        onClick={toggle}
      />
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-background",
          "transition-transform duration-300 ease-in-out",
          "border-r",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <BedDouble className="mr-2 h-5 w-5" />
          <span className="text-lg font-semibold">Pousada Admin</span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto lg:hidden"
            onClick={toggle}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col h-[calc(100vh-3.5rem)]">
          <div className="flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-2">
              {/* Menus com Submenu */}
              {filteredMenuWithSubmenu.map((menu, index) => (
                <div key={index} className="mb-2">
                  <button
                    onClick={() => {
                      if (menu.name === "Hospedagem")
                        setHospedagemOpen(!hospedagemOpen);
                      if (menu.name === "Configurações")
                        setConfigOpen(!configOpen);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      "text-muted-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <menu.icon className="h-5 w-5" />
                      <span>{menu.name}</span>
                    </div>
                    {(menu.name === "Hospedagem" && hospedagemOpen) ||
                    (menu.name === "Configurações" && configOpen) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {menu.name === "Hospedagem" && hospedagemOpen && (
                    <div className="pl-10 space-y-1 mt-1">
                      {menu.submenu
                        .filter(
                          (subItem) =>
                            user && subItem.roles.includes(user.role as any)
                        )
                        .map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            className={cn(
                              "flex items-center rounded-md px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                              pathname === subItem.href
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                    </div>
                  )}
                  {menu.name === "Configurações" && configOpen && (
                    <div className="pl-10 space-y-1 mt-1">
                      {menu.submenu
                        .filter(
                          (subItem) =>
                            user && subItem.roles.includes(user.role as any)
                        )
                        .map((subItem, subIndex) => (
                          <Link
                            key={subIndex}
                            href={subItem.href}
                            className={cn(
                              "flex items-center rounded-md px-3 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground",
                              pathname === subItem.href
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Itens de Navegação Principal */}
              {filteredNavItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[0.625rem] font-medium text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t p-2">
            <nav className="grid gap-1">
              {/* Ajuda e Sair */}
              <Link
                href="/help"
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  pathname === "/help"
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
              >
                <HelpCircle className="h-5 w-5" />
                <span>Ajuda</span>
              </Link>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                )}
              >
                <LogOut className="h-5 w-5" />
                <span>Sair</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
