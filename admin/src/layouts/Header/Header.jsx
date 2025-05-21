import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from "@/components/ui/navigation-menu";

import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { handleLogoutAPI } from "@/apis";
import { useNotifications } from "@/context/NotificationContext";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  // Get notification context
  const notificationContext = useNotifications();
  const unreadCount = notificationContext?.unreadCount || 0;
  const markAsRead = notificationContext?.markAsRead;

  const getLinkClass = (path) => {
    return `${navigationMenuTriggerStyle()} ${location.pathname === path ? "text-white" : ""}`;
  };

  const handleLogout = async () => {
    try {
      await handleLogoutAPI();
    } catch (err) {
      // Có thể bỏ qua lỗi logout
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      navigate("/login");
    }
  };

  // Mark notifications as read when clicking on Orders
  const handleOrdersClick = () => {
    if (unreadCount > 0 && typeof markAsRead === "function") {
      markAsRead();
    }
  };

  return (
    <header className="flex h-20 items-center justify-between border border-[#262626] px-16">
      <div className="flex items-center space-x-4">
        <div className="navbar navbar-expand-lg navbar-light bg-light">
          <DropdownMenu>
            <DropdownMenuTrigger className="d-block rounded border border-[#262626] px-3 py-1 pr-[120px] outline-none">
              Icme INC
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[200px]">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Billing</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Team</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">Subscription</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer hover:text-red-500" onClick={handleLogout}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/" className={getLinkClass("/overview")}>
                Overview
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/customers" className={getLinkClass("/customers")}>
                Customers
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/products" className={getLinkClass("/products")}>
                Products
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link to="/orders" className={getLinkClass("/orders")} onClick={handleOrdersClick}>
                Orders
                {unreadCount > 0 && (
                  <span className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      <ModeToggle />
    </header>
  );
}
