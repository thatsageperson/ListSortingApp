import { useState, useCallback, useRef, useEffect } from "react";

const SEARCH_HISTORY_KEY = "jot-search-history";
const MAX_HISTORY = 10;
const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;

/**
 * Provides debounced search with abort control and localStorage search history.
 */
export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [searchHistory, setSearchHistory] = useState([]);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) setSearchHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const saveHistory = useCallback((history) => {
    setSearchHistory(history);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(history));
    } catch {}
  }, []);

  const addToHistory = useCallback(
    (q) => {
      const trimmed = q.trim();
      if (trimmed.length < MIN_QUERY_LENGTH) return;
      setSearchHistory((prev) => {
        const filtered = prev.filter(
          (h) => h.toLowerCase() !== trimmed.toLowerCase()
        );
        const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY);
        try {
          localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    saveHistory([]);
  }, [saveHistory]);

  const removeHistoryItem = useCallback(
    (item) => {
      setSearchHistory((prev) => {
        const updated = prev.filter((h) => h !== item);
        try {
          localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    []
  );

  const executeSearch = useCallback(
    async (searchQuery) => {
      const trimmed = searchQuery.trim();

      if (trimmed.length < MIN_QUERY_LENGTH) {
        setResults([]);
        setTotal(0);
        setHasMore(false);
        setIsSearching(false);
        return;
      }

      // Abort in-flight request
      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setIsSearching(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Search failed");
        }
        const data = await res.json();
        setResults(data.results);
        setTotal(data.total);
        setHasMore(data.hasMore);
        addToHistory(trimmed);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
          setResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    },
    [addToHistory]
  );

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setTotal(0);
      setHasMore(false);
      setError(null);
      return;
    }

    if (query.trim().length > MAX_QUERY_LENGTH) {
      setError("Search query must be at most 100 characters");
      return;
    }

    debounceRef.current = setTimeout(() => {
      executeSearch(query);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, executeSearch]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  return {
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
  };
}
