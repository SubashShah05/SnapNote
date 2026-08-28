import { useState, useEffect } from "react";

/**
 * Debounces a value — only updates after `delay` ms of no changes.
 * @param {*} value - The value to debounce
 * @param {number} delay - Debounce delay in ms
 */
export function useDebounce(value, delay = 350) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
