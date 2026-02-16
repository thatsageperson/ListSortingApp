import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useSearch } from "@/hooks/useSearch";
import { SearchResults } from "./SearchResults";
import { SearchHistory } from "./SearchHistory";

/**
 * Expandable search bar: collapses to an icon button, expands to a full input
 * on click or Cmd+K / Ctrl+K. Shows results dropdown and search history.
 */
export function SearchBar({ setActiveTab, setSidebarOpen }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const {
    query,
    setQuery,
    results,
    total,
    hasMore,
    isSearching,
    error,
    searchHistory,
    clearHistory,
    removeHistoryItem,
  } = useSearch();

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsFocused(false);
    setQuery("");
  }, [setQuery]);

  // Keyboard shortcut: Cmd+K / Ctrl+K to open, Escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          inputRef.current?.focus();
        } else {
          setIsOpen(true);
        }
      }
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        handleClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, handleClose]);

  const handleResultClick = useCallback(
    (result) => {
      setActiveTab(String(result.list_id));
      setSidebarOpen(false);
      handleClose();
    },
    [setActiveTab, setSidebarOpen, handleClose]
  );

  const handleHistoryClick = useCallback(
    (historyQuery) => {
      setQuery(historyQuery);
    },
    [setQuery]
  );

  const showDropdown =
    isFocused &&
    (query.trim().length >= 2 || searchHistory.length > 0);

  // Group results by list_id
  const groupedResults = results.reduce((groups, result) => {
    const key = result.list_id;
    if (!groups[key]) {
      groups[key] = {
        listId: result.list_id,
        listName: result.list_name,
        items: [],
      };
    }
    groups[key].items.push(result);
    return groups;
  }, {});
  const groupedArray = Object.values(groupedResults);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-cream dark:hover:bg-slate-800 rounded-2xl transition-colors"
        aria-label="Open search (Cmd+K)"
        title="Search (Cmd+K)"
      >
        <Search size={20} className="text-charcoal dark:text-white" />
      </button>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <motion.div
        initial={{ width: 40, opacity: 0.8 }}
        animate={{ width: 280 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex items-center max-w-full bg-white dark:bg-slate-surface border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-lg"
      >
        <div className="pl-3 flex items-center shrink-0">
          {isSearching ? (
            <Loader2 size={16} className="animate-spin text-teal-700" />
          ) : (
            <Search size={16} className="text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value.slice(0, 100))}
          onFocus={() => setIsFocused(true)}
          placeholder="Search..."
          className="flex-1 bg-transparent border-none outline-none px-3 py-2.5 text-sm text-charcoal dark:text-white placeholder-gray-400"
          role="combobox"
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          aria-label="Search lists and items"
          autoComplete="off"
        />
        <div className="flex items-center pr-2 gap-1">
          {!query && (
            <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-slate-800 rounded">
              {navigator?.platform?.includes("Mac") ? "\u2318K" : "Ctrl+K"}
            </kbd>
          )}
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close search"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>

      {/* Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 right-0 w-[340px] max-h-[420px] bg-white dark:bg-slate-surface border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-[70]"
            role="listbox"
          >
            {query.trim().length >= 2 ? (
              <SearchResults
                groupedResults={groupedArray}
                total={total}
                hasMore={hasMore}
                isSearching={isSearching}
                error={error}
                onResultClick={handleResultClick}
              />
            ) : (
              <SearchHistory
                history={searchHistory}
                onHistoryClick={handleHistoryClick}
                onRemoveItem={removeHistoryItem}
                onClear={clearHistory}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
