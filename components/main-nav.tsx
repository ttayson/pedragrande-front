import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu"
import { Icons } from "./icons"

interface NavItem {
  title: string
  href: string
  icon: keyof typeof Icons
  submenu?: NavItem[]
}

const MainNav = () => {
  const navigationItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: "dashboard",
    },
    {
      title: "Clientes",
      href: "/clientes",
      icon: "users",
    },
    {
      title: "Hospedagem",
      href: "/hospedagem",
      icon: "hotel",
      submenu: [
        {
          title: "Acomodações",
          href: "/hospedagem/acomodacoes",
          icon: "bed",
        },
        {
          title: "Tipos de Acomodação",
          href: "/hospedagem/tipos",
          icon: "tag",
        },
        {
          title: "Adicionais",
          href: "/hospedagem/adicionais",
          icon: "plus-circle",
        },
      ],
    },
    {
      title: "Reservas",
      href: "/reservas",
      icon: "calendar",
    },
    {
      title: "Financeiro",
      href: "/financeiro",
      icon: "dollarSign",
    },
    {
      title: "Relatórios",
      href: "/relatorios",
      icon: "barChart",
    },
  ]

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {navigationItems.map(
          (item) =>
            (
              <NavigationMenuItem key={item.title}>
            <NavigationMenuLink href={item.href} className="flex items-center gap-2">\
              <Icons[item.icon] className="h-4 w-4" />
              {item.title}
            </NavigationMenuLink>
            {item.submenu && (
              <ul className="pl-4">
                {item.submenu.map((subitem) => (
                  <li key={subitem.title}>
                    <NavigationMenuLink href={subitem.href} className="flex items-center gap-2">
                      <Icons[subitem.icon] className="h-4 w-4" />
                      {subitem.title}
                    </NavigationMenuLink>
                  </li>
                ))}
              </ul>
            )}
          </NavigationMenuItem>
            ),
        )}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export default MainNav

