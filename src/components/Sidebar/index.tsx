import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Users,
  Settings,
  DollarSign,
  Bell,
  Globe,
  BookOpen,
  Briefcase,
  Calendar,
  MessageSquare,
  HelpCircle,
  Home,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  Search,
  Moon,
  Sun,
  LogOut,
  User,
} from "lucide-react";

// Dark mode switcher component
const DarkModeSwitcher = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 flex h-9 w-9 items-center justify-center rounded-full"
    >
      {darkMode ? (
        <Sun className="text-gray-600 dark:text-gray-300 h-5 w-5" />
      ) : (
        <Moon className="text-gray-600 dark:text-gray-300 h-5 w-5" />
      )}
    </button>
  );
};

// User dropdown component
const DropdownUser = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full"
      >
        <span className="hidden text-right lg:block">
          <span className="text-gray-700 dark:text-gray-300 block text-sm font-medium">
            John Doe
          </span>
          <span className="text-gray-500 dark:text-gray-400 block text-xs">
            Administrator
          </span>
        </span>
        <div className="border-gray-300 dark:border-gray-600 h-10 w-10 overflow-hidden rounded-full border-2">
          <img
            src="/api/placeholder/40/40"
            alt="User"
            className="h-full w-full object-cover"
          />
        </div>
      </button>

      {isOpen && (
        <div className="border-gray-200 dark:border-gray-700 dark:bg-gray-800 absolute right-0 mt-2 w-60 rounded-lg border bg-white py-2 shadow-lg">
          <div className="px-4 py-2">
            <span className="text-gray-700 dark:text-gray-300 block text-sm font-medium">
              John Doe
            </span>
            <span className="text-gray-500 dark:text-gray-400 block text-xs">
              john.doe@Ami Uddokta.com
            </span>
          </div>
          <hr className="border-gray-200 dark:border-gray-700 my-2" />
          <ul className="space-y-1 px-2">
            <li>
              <Link
                href="/admin/profile"
                className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center rounded-lg px-4 py-2 text-sm"
              >
                <User className="mr-2 h-4 w-4" />
                <span>My Profile</span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center rounded-lg px-4 py-2 text-sm"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Account Settings</span>
              </Link>
            </li>
            <li>
              <hr className="border-gray-200 dark:border-gray-700 my-2" />
            </li>
            <li>
              <button
                className="text-red-600 hover:bg-gray-100 dark:text-red-400 dark:hover:bg-gray-700 flex w-full items-center rounded-lg px-4 py-2 text-sm"
                onClick={() => console.log("Logout clicked")}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

// Define route access by role - cleaned up for BDRIS functionality only
const roleRoutes = {
  super_admin: [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "BDRIS Applications",
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
        {
          title: "Application Reports",
          href: "/admin/admin-reports",
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
        {
          title: "User Settings",
          href: "/admin/users/settings",
        },
      ],
    },
  ],
  admin: [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "BDRIS Applications",
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
    },
  ],
  entrepreneur: [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "My Applications",
      href: "/admin/bdris-applications",
      icon: <FileText className="h-4 w-4" />,
    },
  ],
};

// Header component
const Header = ({
  sidebarOpen,
  setSidebarOpen,
  userRole = "super_admin",
}: any) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (e: any) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      // Flatten routes including children for searching
      const routes = (roleRoutes as any)[userRole] || [];
      const flattenedRoutes = routes.flatMap((route: any) =>
        route.submenu
          ? [{ title: route.title, href: route.href }, ...route.submenu]
          : [{ title: route.title, href: route.href }],
      );

      const results = flattenedRoutes.filter((route: any) =>
        route.title.toLowerCase().includes(query.toLowerCase()),
      );

      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <header className="dark:bg-gray-800 fixed left-0 top-0 z-50 w-full bg-white shadow-md">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 mr-4 rounded-md p-2 dark:hover:text-white lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/api/placeholder/40/40"
              alt="Ami Uddokta"
              className="h-8 w-8 rounded"
            />
            <span className="text-gray-800 ml-2 text-xl font-bold dark:text-white">
              Ami Uddokta
            </span>
          </Link>
        </div>

        {/* Search bar */}
        <div className="hidden flex-1 items-center justify-center px-6 lg:flex">
          <div className="relative w-full max-w-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="text-gray-400 h-5 w-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              className="border-gray-300 text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:bg-gray-700 dark:placeholder-gray-400 w-full rounded-md border bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:text-white dark:focus:border-blue-500"
              placeholder="Search for anything..."
            />

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div className="border-gray-300 dark:border-gray-600 dark:bg-gray-700 absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-md border bg-white shadow-lg">
                {searchResults.map((result: any, index) => (
                  <Link
                    key={index}
                    href={result.href}
                    onClick={() => setSearchResults([])}
                    className="text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600 block px-4 py-2 text-sm"
                  >
                    {result.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Mobile search button */}
          <button className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 rounded-full p-2 dark:hover:text-white lg:hidden">
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 relative rounded-full p-2 dark:hover:text-white">
              <Bell className="h-5 w-5" />
              <span className="bg-red-500 absolute -right-0 -top-0 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-white">
                3
              </span>
            </button>
          </div>

          {/* Language switcher */}
          <button className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 rounded-full p-2 dark:hover:text-white">
            <Globe className="h-5 w-5" />
          </button>

          {/* Dark mode switcher */}
          <DarkModeSwitcher />

          {/* User dropdown */}
          <DropdownUser />
        </div>
      </div>
    </header>
  );
};

// Navigation item component
const NavItem = ({ item, pathname, isExpanded }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");

  useEffect(() => {
    // Auto-expand the submenu if current path is in it
    if (item.submenu && !isOpen) {
      const activeInSubmenu = item.submenu.some(
        (subItem: any) =>
          pathname === subItem.href || pathname.startsWith(subItem.href + "/"),
      );
      if (activeInSubmenu) {
        setIsOpen(true);
      }
    }
  }, [pathname, item.submenu, isOpen]);

  if (item.submenu) {
    return (
      <div className="mb-1">
        <button
          className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            isActive
              ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
              : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          }`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="flex items-center">
            {item.icon}
            {isExpanded && <span className="ml-3 truncate">{item.title}</span>}
          </span>
          {isExpanded && (
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </button>

        {isOpen && isExpanded && (
          <div className="border-gray-200 dark:border-gray-700 ml-4 mt-1 space-y-1 border-l-2 pl-2">
            {item.submenu.map((subItem: any, index: any) => (
              <Link
                key={index}
                href={subItem.href}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === subItem.href ||
                  pathname.startsWith(subItem.href + "/")
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                }`}
              >
                {subItem.icon}
                <span className="ml-3 truncate">{subItem.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={`mb-1 flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-gray-100"
      }`}
    >
      {item.icon}
      {isExpanded && <span className="ml-3 truncate">{item.title}</span>}
    </Link>
  );
};

// Sidebar component
const Sidebar = ({ userRole = "super_admin", isOpen, setIsOpen }: any) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
        setIsExpanded(true);
      } else {
        setIsOpen(false);
        setIsExpanded(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  const navItems = (roleRoutes as any)[userRole] || [];

  // If no items for role, return null
  if (!navItems.length) {
    return null;
  }

  // For mobile backdrop when sidebar is open
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
        className={`dark:bg-gray-800 fixed left-0 top-0 z-50 h-screen bg-white pt-16 shadow-lg transition-all duration-300 ease-in-out lg:z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isExpanded ? "w-64" : "w-20"}`}
      >
        <div className="flex h-full flex-col justify-between">
          {/* Main navigation */}
          <div className="no-scrollbar h-full overflow-y-auto px-4 py-6">
            <div className="space-y-1">
              {navItems.map((item: any, index: any) => (
                <NavItem
                  key={index}
                  item={item}
                  pathname={pathname}
                  isExpanded={isExpanded}
                />
              ))}
            </div>
          </div>

          {/* Footer with collapse button */}
          <div className="border-gray-200 dark:border-gray-700 border-t px-4 py-3">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex w-full items-center justify-center rounded-md p-2"
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

// Main layout component
const AdminLayout = ({ children }: any) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState("super_admin"); // Can be changed to "admin" or "agent"

  return (
    <div className="bg-gray-50 dark:bg-gray-900 flex min-h-screen flex-col">
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userRole={userRole}
      />

      <Sidebar
        userRole={userRole}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />

      <main
        className={`flex-1 transition-all duration-300 lg:pl-64 ${!sidebarOpen ? "lg:pl-20" : ""}`}
      >
        <div className="container mx-auto px-4 py-20 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
