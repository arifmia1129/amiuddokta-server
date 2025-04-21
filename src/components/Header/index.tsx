import Link from "next/link";
import DarkModeSwitcher from "./DarkModeSwitcher";
import DropdownUser from "./DropdownUser";
import Image from "next/image";
import { LuExternalLink } from "react-icons/lu";
import { IoNotifications } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { useState } from "react";
import constant from "@/constant";

interface LinkItem {
  name: string;
  path: string;
  children?: LinkItem[];
}

const allLinks = [
  {
    name: "Admin users",
    path: "/admin/user/user-list",
    children: [
      { name: "Add new user", path: "/admin/user/create-user" },
      { name: "All users", path: "/admin/user/user-list" },
    ],
  },
  {
    name: "Email system",
    path: "/admin/email/all-template",
    children: [
      { name: "All templates", path: "/admin/email/all-template" },
      { name: "All SMTP", path: "/admin/email/all-smtp" },
      { name: "All campaigns", path: "/admin/email/campaign-list" },
    ],
  },
  {
    name: "Subscribers",
    path: "/admin/subscriber/list",
    children: [
      { name: "Add new subscriber", path: "/admin/subscriber/create" },
      { name: "All subscribers", path: "/admin/subscriber/list" },
    ],
  },
  {
    name: "Media",
    path: "/admin/media",
    children: [
      { name: "Upload", path: "/admin/media/upload" },
      { name: "Library", path: "/admin/media" },
    ],
  },
  {
    name: "Pages",
    path: "/admin/page",
    children: [
      { name: "Add new page", path: "/admin/page/create" },
      { name: "All pages", path: "/admin/page" },
    ],
  },
  {
    name: "Articles",
    path: "/admin/blog",
    children: [
      { name: "Add new article", path: "/admin/blog/create" },
      { name: "All articles", path: "/admin/blog" },
      { name: "Add new category", path: "/admin/category/create" },
      { name: "All categories", path: "/admin/category" },
    ],
  },
  {
    name: "Comments",
    path: "/admin/comment",
    children: [
      { name: "Add new comment", path: "/admin/comment/create" },
      { name: "All comments", path: "/admin/comment" },
    ],
  },
  {
    name: "Supports",
    path: "/admin/support",
    children: [
      { name: "Add new", path: "/admin/support/create" },
      { name: "All support", path: "/admin/support" },
    ],
  },
  {
    name: "FAQ",
    path: "/admin/faq",
    children: [
      { name: "Add new FAQ ", path: "/admin/faq/create" },
      { name: "All FAQ", path: "/admin/faq" },
      { name: "Add new FAQ category", path: "/admin/faq/category/create" },
      { name: "All FAQ categories", path: "/admin/faq/category" },
    ],
  },
  {
    name: "Settings",
    path: "/admin/setting",
    children: [
      { name: "Add new setting", path: "/admin/settings/create" },
      { name: "All setting", path: "/admin/settings" },
    ],
  },
];

const Header = (props: {
  sidebarOpen: boolean;
  setSidebarOpen: (arg0: boolean) => void;
}) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<LinkItem[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      // Flatten allLinks including children
      const results = allLinks
        .flatMap((link) => (link.children ? [link, ...link.children] : [link]))
        .filter((link) =>
          link.name.toLowerCase().includes(query.toLowerCase()),
        );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      router.push(searchResults[0].path); // Redirect to the first result's path
    }
  };

  return (
    <header className="sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none">
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-4 lg:hidden">
          <button
            aria-controls="sidebar"
            onClick={(e) => {
              e.stopPropagation();
              props.setSidebarOpen(!props.sidebarOpen);
            }}
            className="z-99999 block rounded-sm border border-stroke bg-white p-1.5 shadow-sm dark:border-strokedark dark:bg-boxdark lg:hidden"
          >
            <span className="relative block h-5.5 w-5.5 cursor-pointer">
              <span className="du-block absolute right-0 h-full w-full">
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-[0] duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!w-full delay-300"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-150 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "delay-400 !w-full"
                  }`}
                ></span>
                <span
                  className={`relative left-0 top-0 my-1 block h-0.5 w-0 rounded-sm bg-black delay-200 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!w-full delay-500"
                  }`}
                ></span>
              </span>
              <span className="absolute right-0 h-full w-full rotate-45">
                <span
                  className={`absolute left-2.5 top-0 block h-full w-0.5 rounded-sm bg-black delay-300 duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!h-0 !delay-[0]"
                  }`}
                ></span>
                <span
                  className={`delay-400 absolute left-0 top-2.5 block h-0.5 w-full rounded-sm bg-black duration-200 ease-in-out dark:bg-white ${
                    !props.sidebarOpen && "!h-0 !delay-200"
                  }`}
                ></span>
              </span>
            </span>
          </button>

          <Link className="block flex-shrink-0 lg:hidden" href="/">
            <Image
              width={32}
              height={32}
              src={"/images/logo/logo-icon.svg"}
              alt="Logo"
            />
          </Link>
        </div>

        <div className="hidden sm:block">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <button
                type="submit"
                className="absolute left-0 top-1/2 -translate-y-1/2"
              >
                <svg
                  className="fill-body hover:fill-primary dark:fill-bodydark dark:hover:fill-primary"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                    fill=""
                  />
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                    fill=""
                  />
                </svg>
              </button>

              <input
                type="text"
                placeholder="Type to search..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full bg-transparent pl-9 pr-4 font-medium focus:outline-none xl:w-125"
              />
            </div>

            {/* Dropdown for search results */}
            <div className="relative w-full">
              {searchResults.length > 0 && (
                <ul className="border-borderdark absolute top-10 mx-auto mt-2 max-h-60 w-[80vw] overflow-y-auto border bg-white shadow-lg dark:bg-boxdark">
                  {searchResults.map((result) => (
                    <li key={result.path}>
                      <Link
                        href={result.path}
                        className="block px-4 py-2 text-bodydark2 hover:bg-primary hover:text-white"
                      >
                        {result.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </form>
        </div>

        <div className="flex items-center gap-3 2xsm:gap-7">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            <DarkModeSwitcher />
            <DropdownUser />
            <Link
              href="#"
              className="hover:bg-lightgray flex items-center justify-center rounded-full p-1.5 dark:hover:bg-strokedark"
            >
              <IoNotifications className="text-xl" />
              <span className="absolute right-0 top-0 flex h-2 w-2 rounded-full bg-primary"></span>
            </Link>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
