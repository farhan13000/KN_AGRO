import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

/**
 * Multi-value searchable dropdown. Same event contract as SearchableSelect
 * (`onChange({ target: { name, value } })`) except `value` is an array and
 * every pick/removal emits the whole updated array — matches how plain
 * HTML multi-selects are already handled by callers, just without the
 * ctrl/cmd-click UX a native <select multiple> would require.
 */
export default function SearchableMultiSelect({
  label,
  error,
  required,
  id,
  name,
  value = [],
  onChange,
  options = [],
  placeholder = "Search...",
  disabled = false,
}) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  const selectedValues = Array.isArray(value) ? value : [];
  const selectedOptions = selectedValues
    .map((optionValue) => options.find((option) => option.value === optionValue))
    .filter(Boolean);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableOptions = useMemo(
    () => options.filter((option) => !selectedValues.includes(option.value)),
    [options, selectedValues],
  );

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return availableOptions;
    return availableOptions.filter((option) => t(option.label).toLowerCase().includes(normalizedQuery));
  }, [availableOptions, query, t]);

  const emitChange = (newValues) => {
    onChange({ target: { name, value: newValues } });
  };

  const addValue = (optionValue) => {
    emitChange([...selectedValues, optionValue]);
    setQuery("");
    setHighlightedIndex(-1);
  };

  const removeValue = (optionValue) => {
    emitChange(selectedValues.filter((current) => current !== optionValue));
  };

  const handleKeyDown = (event) => {
    if (event.key === "Backspace" && !query && selectedValues.length) {
      removeValue(selectedValues[selectedValues.length - 1]);
      return;
    }
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        event.preventDefault();
        setIsOpen(true);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) => Math.min(current + 1, filteredOptions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const option = filteredOptions[highlightedIndex];
      if (option) addValue(option.value);
    } else if (event.key === "Escape") {
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <div ref={containerRef}>
      <label className="form-label" htmlFor={id}>
        {t(label)} {required ? <span className="text-red-700">*</span> : null}
      </label>
      <div className="relative">
        <div
          className="form-field flex min-h-[3.25rem] flex-wrap items-center gap-1.5 py-2"
          onClick={() => {
            inputRef.current?.focus();
            setIsOpen(true);
          }}
        >
          {selectedOptions.map((option) => (
            <span
              className="inline-flex items-center gap-1 rounded-lg bg-mint px-2 py-1 text-xs font-semibold text-forest"
              key={option.value}
            >
              {t(option.label)}
              <button
                aria-label={`Remove ${t(option.label)}`}
                className="rounded-full p-0.5 hover:bg-forest/15"
                onClick={(event) => {
                  event.stopPropagation();
                  removeValue(option.value);
                }}
                type="button"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <input
            aria-describedby={error ? `${id}-error` : undefined}
            aria-invalid={Boolean(error)}
            autoComplete="off"
            className="min-w-[8rem] flex-1 border-0 bg-transparent p-0 text-sm text-ink outline-none focus:outline-none focus:ring-0"
            disabled={disabled}
            id={id}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
              setHighlightedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedOptions.length ? "" : t(placeholder)}
            ref={inputRef}
            value={query}
          />
        </div>
        {isOpen ? (
          <ul
            className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-auto rounded-xl border border-forest/15 bg-white py-1 shadow-lg"
            role="listbox"
          >
            {filteredOptions.length ? (
              filteredOptions.map((option, index) => (
                <li
                  className={`cursor-pointer px-4 py-2 text-sm font-medium ${
                    index === highlightedIndex ? "bg-mint/60 text-forest" : "text-ink"
                  }`}
                  key={option.value}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    addValue(option.value);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  role="option"
                >
                  {t(option.label)}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-sm text-muted">
                {selectedValues.length ? "No more matches" : "No matches"}
              </li>
            )}
          </ul>
        ) : null}
      </div>
      {error ? (
        <p className="form-error" id={`${id}-error`}>
          {t(error)}
        </p>
      ) : null}
    </div>
  );
}
