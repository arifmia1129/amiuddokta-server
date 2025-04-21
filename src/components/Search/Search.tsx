import React, { useState, useEffect } from "react";
import { debounce } from "lodash";

type SearchProps = {
  onSearch: (searchText: string, currentPage?: number, limit?: number) => void;
  placeholder?: string;
  debounceDelay?: number;
  currentPage?: number;
  limit?: number;
};

const Search: React.FC<SearchProps> = ({
  onSearch,
  placeholder = "Search...",
  debounceDelay = 600,
}) => {
  const [searchText, setSearchText] = useState("");

  const debouncedSearch = debounce((text) => onSearch(text), debounceDelay);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={searchText}
      className="w-80 rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
      onChange={handleSearchInputChange}
    />
  );
};

export default Search;
