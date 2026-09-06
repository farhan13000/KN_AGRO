import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

/**
 * Single-value searchable dropdown — same prop contract as Select.jsx
 * (id/label/error/required/name/value/onChange/options, onChange fired as
 * a native-event-shaped `{ target: { name, value } }`) so it drops in
 * anywhere Select is used today, just with type-to-filter instead of the
 * browser's native <select> list.
 */
export default function SearchableSelect({
  label,
  error,
  required,
  id,
  name,
  value,
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

  const selectedOption = options.find((option) => option.value === value);

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

  const filteredOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter((option) => t(option.label).toLowerCase().includes(normalizedQuery));
  }, [options, query, t]);

  const emitChange = (newValue) => {
    onChange({ target: { name, value: newValue } });
  };

  const openList = () => {
    if (disabled) return;
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelect = (option) => {
    emitChange(option.value);
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (event) => {
    if (!isOpen) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        event.preventDefault();
        openList();
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
      if (option) handleSelect(option);
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
        <input
          aria-describedby={error ? `${id}-error` : undefined}
          aria-invalid={Boolean(error)}
          autoComplete="off"
          className="form-field pr-9"
          disabled={disabled}
          id={id}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={openList}
          onKeyDown={handleKeyDown}
          placeholder={selectedOption ? t(selectedOption.label) : t(placeholder)}
          value={isOpen ? query : selectedOption ? t(selectedOption.label) : ""}
        />
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        {isOpen ? (
          <ul
            className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-auto rounded-xl border border-forest/15 bg-white py-1 shadow-lg"
            role="listbox"
          >
            {filteredOptions.length ? (
              filteredOptions.map((option, index) => (
                <li
                  aria-selected={option.value === value}
                  className={`cursor-pointer px-4 py-2 text-sm font-medium ${
                    option.value === value
                      ? "bg-mint text-forest"
                      : index === highlightedIndex
                        ? "bg-mint/60 text-forest"
                        : "text-ink"
                  }`}
                  key={option.value}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(option);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  role="option"
                >
                  {t(option.label)}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-sm text-muted">No matches</li>
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
