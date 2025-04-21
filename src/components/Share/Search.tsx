import React, { useState, useEffect } from "react";
import { debounce } from "lodash";
import { Search, X } from "lucide-react";

interface SearchProps {
  onSearch: (searchText: string) => void;
  placeholder?: string;
  debounceDelay?: number;
  className?: string;
}

const ImprovedSearch: React.FC<SearchProps> = ({
  onSearch,
  placeholder = "Search...",
  debounceDelay = 400,
  className = "",
}) => {
  const [searchText, setSearchText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  // Create a debounced search function
  const debouncedSearch = debounce((text) => {
    console.log(text);
    onSearch(text);
  }, 400);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  const handleClear = () => {
    setSearchText("");
    onSearch("");
  };

  return (
    <div className={`relative max-w-md flex-1 ${className}`}>
      <div
        className={`flex w-full items-center rounded-md border ${
          isFocused
            ? "border-primary ring-1 ring-primary"
            : "border-gray-200 dark:border-gray-700"
        } bg-white transition-all duration-150 dark:bg-boxdark`}
      >
        <div className="py-2 pl-3">
          <Search
            className={`h-5 w-5 ${isFocused ? "text-primary" : "text-gray-400"}`}
          />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchText}
          className="text-gray-900 flex-1 border-none bg-transparent px-3 py-2.5 text-sm outline-none dark:text-white"
          onChange={handleSearchInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {searchText && (
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 py-2 pr-3"
            aria-label="Clear search"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ImprovedSearch;
