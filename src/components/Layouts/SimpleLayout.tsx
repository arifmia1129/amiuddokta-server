"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Users,
  Home,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  Bell,
  LogOut,
  User,
} from "lucide-react";

interface NavItemType {
  title: string;
  href: string;
  icon: React.ReactNode;
  submenu?: {
    title: string;
    href: string;
  }[];
}

interface LayoutProps {
  children: React.ReactNode;
}

// Quick Apply Navigation - Single role system
const adminNavItems: NavItemType[] = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: <Home className="h-4 w-4" />,
  },
  {
    title: "Applications",
    href: "/admin/bdris-applications",
    icon: <FileText className="h-4 w-4" />,
    submenu: [
      {
        title: "All Applications",
        href: "/admin/bdris-applications",
      },
      {
        title: "Failed Applications",
        href: "/admin/bdris-applications/errors",
      },
    ],
  },
  {
    title: "Users Management",
    href: "/admin/users",
    icon: <Users className="h-4 w-4" />,
    submenu: [
      {
        title: "All Users",
        href: "/admin/users",
      },
      {
        title: "Add User",
        href: "/admin/users/add",
      },
    ],
  },
];

// Navigation Item Component
const NavItem: React.FC<{
  item: NavItemType;
  pathname: string;
  isExpanded: boolean;
}> = ({ item, pathname, isExpanded }) => {
  const [isSubmenuOpen, setIsSubmenuOpen] = useState(false);
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const hasSubmenu = item.submenu && item.submenu.length > 0;

  const toggleSubmenu = () => {
    if (hasSubmenu) {
      setIsSubmenuOpen(!isSubmenuOpen);
    }
  };

  return (
    <div className="mb-1">
      <div
        className={`flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
          isActive
            ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
            : "text-gray-700 dark:text-gray-300"
        }`}
        onClick={hasSubmenu ? toggleSubmenu : undefined}
      >
        <Link
          href={item.href}
          className="flex w-full items-center"
          onClick={(e) => hasSubmenu && e.preventDefault()}
        >
          <span className="flex-shrink-0">{item.icon}</span>
          {isExpanded && (
            <>
              <span className="ml-3 flex-1">{item.title}</span>
              {hasSubmenu && (
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    isSubmenuOpen ? "rotate-180" : ""
                  }`}
                />
              )}
            </>
          )}
        </Link>
      </div>

      {/* Submenu */}
      {hasSubmenu && isSubmenuOpen && isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {item.submenu?.map((subItem, index) => {
            const isSubActive = pathname === subItem.href;
            return (
              <Link
                key={index}
                href={subItem.href}
                className={`block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  isSubActive
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {subItem.title}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Header Component
const Header: React.FC<{
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200 dark:bg-black dark:border-gray-700">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 lg:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          <button className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            <Search className="h-5 w-5" />
          </button>
          <button className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800">
            <Bell className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-gray-300"></div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Super Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

// Sidebar Component
const Sidebar: React.FC<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}> = ({ isOpen, setIsOpen }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();

  // Mobile backdrop
  const MobileBackdrop = () => (
    <div
      className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity lg:hidden ${
        isOpen ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={() => setIsOpen(false)}
    />
  );

  return (
    <>
      <MobileBackdrop />
      
      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-white shadow-lg transition-all duration-300 ease-in-out dark:bg-black lg:static lg:z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${isExpanded ? "w-64" : "w-20"}`}
      >
        <div className="flex h-full flex-col justify-between">
          <div className="flex-1 overflow-hidden">
            {/* Header/Logo section */}
            <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded bg-blue-600"></div>
                {isExpanded && (
                  <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                    Quick Apply
                  </h1>
                )}
              </div>
            </div>

            {/* Main navigation */}
            <div className="px-4 py-6">
              <div className="space-y-1">
                {adminNavItems.map((item, index) => (
                  <NavItem
                    key={index}
                    item={item}
                    pathname={pathname}
                    isExpanded={isExpanded}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Footer with collapse button */}
          <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex w-full items-center justify-center rounded-md bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-black dark:text-gray-300 dark:hover:bg-gray-600"
            >
              {isExpanded ? (
                <ChevronLeft className="h-5 w-5" />
              ) : (
                <ChevronRight className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

// Main Layout Component
const SimpleLayout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-1 flex-col">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SimpleLayout;