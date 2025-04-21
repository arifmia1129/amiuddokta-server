"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  FileText,
  Users,
  Settings,
  DollarSign,
  Bell,
  Globe,
  BookOpen,
  Briefcase,
  MessageSquare,
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
  UserCircle,
  StickyNote,
  Files,
  MessageCircle,
  Mail,
  VideoIcon,
  BriefcaseIcon,
} from "lucide-react";
import { getCurrentUser, logout } from "@/app/lib/actions/user/user.controller";
import { GetCurrentUserResponse, User as UserType } from "@/types/user";
import Image from "next/image";
import constant from "@/constant";

// Define the types for the components
interface NavItemProps {
  item: NavItemType;
  pathname: string;
  isExpanded: boolean;
}

interface NavItemType {
  title: string;
  href: string;
  icon?: JSX.Element;
  submenu?: NavItemType[];
}

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userRole?: string;
}

interface SidebarProps {
  userRole?: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

interface LayoutProps {
  children: React.ReactNode;
}

// Dark mode switcher component
const DarkModeSwitcher: React.FC = () => {
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
      className="bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 flex h-9 w-9 items-center justify-center rounded-full dark:bg-black"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? (
        <Sun className="text-gray-600 dark:text-gray-300 h-5 w-5" />
      ) : (
        <Moon className="text-gray-600 dark:text-gray-300 h-5 w-5" />
      )}
    </button>
  );
};

const DropdownUser: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.push("/auth/signin");
  };

  const handleGetUserInfo = async () => {
    try {
      setIsLoading(true);
      const response = (await getCurrentUser()) as GetCurrentUserResponse;
      if (response?.success) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleGetUserInfo();
  }, []);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full"
        aria-label="User Menu"
      >
        <span className="hidden text-right lg:block">
          <span className="text-gray-700 dark:text-gray-300 block text-sm font-medium">
            {user?.name || "Loading..."}
          </span>
          <span className="text-gray-500 dark:text-gray-400 block text-xs">
            {user?.role === "super_admin" ? "Super Admin" : "Admin"}
          </span>
        </span>
        <div className="border-gray-300 dark:border-gray-600 h-10 w-10 overflow-hidden rounded-full border-2">
          {user?.profile_image ? (
            <Image
              src={
                user?.profile_image
                  ? `${constant.baseUrl}/api/files?fileName=${user?.profile_image}`
                  : "/images/no_image.png"
              }
              alt={user?.name || "User"}
              width={40}
              height={40}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="bg-gray-200 flex h-full w-full items-center justify-center rounded-full dark:bg-boxdark-2">
              <UserCircle size={64} className="text-gray-400" />
            </div>
          )}
        </div>
      </button>

      {isOpen && user && (
        <div className="border-gray-200 dark:border-gray-700 absolute right-0 mt-2 w-60 rounded-lg border bg-white py-2 shadow-lg dark:bg-black">
          <div className="px-4 py-2">
            <span className="text-gray-700 dark:text-gray-300 block text-sm font-medium">
              {user.name}
            </span>
            <span className="text-gray-500 dark:text-gray-400 block text-xs">
              {user.email}
            </span>
          </div>
          <hr className="border-gray-200 dark:border-gray-700 my-2" />
          <ul className="space-y-1 px-2">
            <li>
              <Link
                href="/profile"
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
                onClick={handleSignOut}
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

// Define route access by role
const roleRoutes: { [key: string]: NavItemType[] } = {
  super_admin: [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <Home className="h-4 w-4" />,
    },
    {
      title: "Media",
      href: "/admin/media",
      icon: <Files className="h-4 w-4" />,
      submenu: [
        {
          title: "Upload",
          href: "/admin/media/upload",
        },
        {
          title: "All Media",
          href: "/admin/media",
        },
      ],
    },
    {
      title: "Users Management",
      href: "/admin/users",
      icon: <Users className="h-4 w-4" />,
      submenu: [
        {
          title: "Add User",
          href: "/admin/users/add",
        },
        {
          title: "All Users",
          href: "/admin/users",
        },
      ],
    },
    {
      title: "Public Services",
      href: "/admin/public-services",
      icon: <Globe className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Public Service",
          href: "/admin/public-services/add",
        },
        {
          title: "All Public Services",
          href: "/admin/public-services",
        },
      ],
    },
    {
      title: "Contact Forms",
      href: "/admin/contact-forms",
      icon: <Mail className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Contact Form",
          href: "/admin/contact-forms/add",
        },
        {
          title: "All Contact Forms",
          href: "/admin/contact-forms",
        },
      ],
    },

    {
      title: "Services",
      href: "/admin/services",
      icon: <Briefcase className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Service Category",
          href: "/admin/services/categories/add",
        },
        {
          title: "All Service Categories",
          href: "/admin/services/categories",
        },

        {
          title: "Add Service",
          href: "/admin/services/add",
        },
        {
          title: "All Services",
          href: "/admin/services",
        },
      ],
    },
    {
      title: "Blogs",
      href: "/admin/blogs",
      icon: <StickyNote className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Blog Category",
          href: "/admin/blogs/categories/add",
        },
        {
          title: "All Blog Categories",
          href: "/admin/blogs/categories",
        },

        {
          title: "Add Blog",
          href: "/admin/blogs/add",
        },
        {
          title: "All Blogs",
          href: "/admin/blogs",
        },
      ],
    },
    {
      title: "Pages",
      href: "/admin/pages",
      icon: <StickyNote className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Page",
          href: "/admin/pages/add",
        },
        {
          title: "All Pages",
          href: "/admin/pages",
        },
      ],
    },
    {
      title: "Feedback",
      href: "/admin/feedbacks",
      icon: <MessageCircle className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Feedback",
          href: "/admin/feedbacks/add",
        },
        {
          title: "All Feedbacks",
          href: "/admin/feedbacks",
        },
      ],
    },
    {
      title: "Team",
      href: "/admin/team",
      icon: <Users className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Team Member",
          href: "/admin/team/add",
        },
        {
          title: "All Team Members",
          href: "/admin/team",
        },
      ],
    },
    {
      title: "Media Corner",
      href: "/admin/media-corner",
      icon: <VideoIcon className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Media Corner Item",
          href: "/admin/media-corner/add",
        },
        {
          title: "All Media Corner Items",
          href: "/admin/media-corner",
        },
      ],
    },

    {
      title: "Careers",
      href: "/admin/careers",
      icon: <BriefcaseIcon className="h-4 w-4" />, // Assuming you have a BriefcaseIcon
      submenu: [
        {
          title: "Add Job Posting",
          href: "/admin/careers/add",
        },
        {
          title: "All Job Postings",
          href: "/admin/careers",
        },
      ],
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Setting",
          href: "/admin/settings/add",
        },
        {
          title: "Settings",
          href: "/admin/settings",
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
      title: "Media",
      href: "/admin/media",
      icon: <Files className="h-4 w-4" />,
      submenu: [
        {
          title: "Upload",
          href: "/admin/media/upload",
        },
        {
          title: "All Media",
          href: "/admin/media",
        },
      ],
    },
    {
      title: "Users Management",
      href: "/admin/users",
      icon: <Users className="h-4 w-4" />,
      submenu: [
        {
          title: "Add User",
          href: "/admin/users/add",
        },
        {
          title: "All Users",
          href: "/admin/users",
        },
      ],
    },
    {
      title: "Public Services",
      href: "/admin/public-services",
      icon: <Globe className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Public Service",
          href: "/admin/public-services/add",
        },
        {
          title: "All Public Services",
          href: "/admin/public-services",
        },
      ],
    },
    {
      title: "Contact Forms",
      href: "/admin/contact-forms",
      icon: <Mail className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Contact Form",
          href: "/admin/contact-forms/add",
        },
        {
          title: "All Contact Forms",
          href: "/admin/contact-forms",
        },
      ],
    },

    {
      title: "Services",
      href: "/admin/services",
      icon: <Briefcase className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Service Category",
          href: "/admin/services/categories/add",
        },
        {
          title: "All Service Categories",
          href: "/admin/services/categories",
        },

        {
          title: "Add Service",
          href: "/admin/services/add",
        },
        {
          title: "All Services",
          href: "/admin/services",
        },
      ],
    },
    {
      title: "Blogs",
      href: "/admin/blogs",
      icon: <StickyNote className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Blog Category",
          href: "/admin/blogs/categories/add",
        },
        {
          title: "All Blog Categories",
          href: "/admin/blogs/categories",
        },

        {
          title: "Add Blog",
          href: "/admin/blogs/add",
        },
        {
          title: "All Blogs",
          href: "/admin/blogs",
        },
      ],
    },
    {
      title: "Pages",
      href: "/admin/pages",
      icon: <StickyNote className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Page",
          href: "/admin/pages/add",
        },
        {
          title: "All Pages",
          href: "/admin/pages",
        },
      ],
    },
    {
      title: "Feedback",
      href: "/admin/feedbacks",
      icon: <MessageCircle className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Feedback",
          href: "/admin/feedbacks/add",
        },
        {
          title: "All Feedbacks",
          href: "/admin/feedbacks",
        },
      ],
    },
    {
      title: "Team",
      href: "/admin/team",
      icon: <Users className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Team Member",
          href: "/admin/team/add",
        },
        {
          title: "All Team Members",
          href: "/admin/team",
        },
      ],
    },
    {
      title: "Media Corner",
      href: "/admin/media-corner",
      icon: <VideoIcon className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Media Corner Item",
          href: "/admin/media-corner/add",
        },
        {
          title: "All Media Corner Items",
          href: "/admin/media-corner",
        },
      ],
    },

    {
      title: "Careers",
      href: "/admin/careers",
      icon: <BriefcaseIcon className="h-4 w-4" />, // Assuming you have a BriefcaseIcon
      submenu: [
        {
          title: "Add Job Posting",
          href: "/admin/careers/add",
        },
        {
          title: "All Job Postings",
          href: "/admin/careers",
        },
      ],
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-4 w-4" />,
      submenu: [
        {
          title: "Add Setting",
          href: "/admin/settings/add",
        },
        {
          title: "Settings",
          href: "/admin/settings",
        },
      ],
    },
  ],
};

// Header component
const Header: React.FC<HeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  userRole = "super_admin",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NavItemType[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      // Flatten routes including children for searching
      const routes = roleRoutes[userRole] || [];
      const flattenedRoutes = routes.flatMap((route) =>
        route.submenu
          ? [{ title: route.title, href: route.href }, ...route.submenu]
          : [{ title: route.title, href: route.href }],
      );

      const results = flattenedRoutes.filter((route) =>
        route.title.toLowerCase().includes(query.toLowerCase()),
      );

      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <header className="fixed left-0 top-0 z-50 w-full bg-white shadow-md dark:bg-black">
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        {/* Left section */}
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 mr-4 rounded-md p-2 dark:hover:text-white lg:hidden"
            aria-label="Toggle Sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Go-Network"
              className="h-16 w-24 rounded"
            />
            <span className="text-gray-800 ml-2 text-xl font-bold dark:text-white">
              GO-Network
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
              className="border-gray-300 text-gray-900 placeholder-gray-500 dark:border-gray-600 dark:placeholder-gray-400 w-full rounded-md border bg-white py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-black dark:text-white dark:focus:border-blue-500"
              placeholder="Search for anything..."
              aria-label="Search"
            />

            {/* Search results dropdown */}
            {searchResults.length > 0 && (
              <div className="border-gray-300 dark:border-gray-600 absolute left-0 right-0 mt-2 max-h-60 overflow-y-auto rounded-md border bg-white shadow-lg dark:bg-black">
                {searchResults.map((result, index) => (
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
          <button
            className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 rounded-full p-2 dark:hover:text-white lg:hidden"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 relative rounded-full p-2 dark:hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="bg-red-500 absolute -right-0 -top-0 flex h-4 w-4 items-center justify-center rounded-full text-xs font-bold text-white">
                3
              </span>
            </button>
          </div>

          {/* Language switcher */}
          <button
            className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 rounded-full p-2 dark:hover:text-white"
            aria-label="Language Switcher"
          >
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
const NavItem: React.FC<NavItemProps> = ({ item, pathname, isExpanded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isActive = pathname === item.href;

  useEffect(() => {
    // Auto-expand the submenu if current path is in it
    if (item.submenu && !isOpen) {
      const activeInSubmenu = item.submenu.some(
        (subItem) => pathname === subItem.href,
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
          aria-expanded={isOpen}
          aria-controls={`submenu-${item.title}`}
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
          <div
            id={`submenu-${item.title}`}
            className="border-gray-200 dark:border-gray-700 ml-4 mt-1 space-y-1 border-l-2 pl-2"
          >
            {item.submenu.map((subItem, index) => (
              <Link
                key={index}
                href={subItem.href}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === subItem.href
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
const Sidebar: React.FC<SidebarProps> = ({
  userRole = "super_admin",
  isOpen,
  setIsOpen,
}) => {
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

  const navItems = roleRoutes[userRole] || [];

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
      aria-hidden={!isOpen}
    />
  );

  return (
    <>
      <MobileBackdrop />

      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-white pt-16 shadow-lg transition-all duration-300 ease-in-out dark:bg-black lg:z-30 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${isExpanded ? "w-64" : "w-20"}`}
      >
        <div className="flex h-full flex-col justify-between">
          {/* Main navigation */}
          <div className="no-scrollbar h-full overflow-y-auto px-4 py-6">
            <div className="space-y-1">
              {navItems.map((item, index) => (
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
              className="bg-gray-100 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-600 flex w-full items-center justify-center rounded-md p-2 dark:bg-black"
              aria-label="Toggle Sidebar Expansion"
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
const DefaultLayout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState("super_admin");

  const router = useRouter();

  const handleCheckAuth = async () => {
    const user = await getCurrentUser();

    if (!user?.success) {
      await logout();
      router.push("/auth/signin");
    }
  };

  useEffect(() => {
    handleCheckAuth();
  }, []);

  return (
    <div className="bg-gray-50 flex min-h-screen flex-col dark:bg-black">
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
        <div className="container mx-auto px-4 py-20 dark:bg-black md:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DefaultLayout;
