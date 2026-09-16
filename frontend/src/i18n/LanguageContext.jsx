import { createContext, useContext, useEffect, useMemo, useState } from "react";

const LanguageContext = createContext(null);
const defaultLanguage = "en";
const cp1252ReverseMap = new Map([
  [0x20ac, 0x80],
  [0x201a, 0x82],
  [0x0192, 0x83],
  [0x201e, 0x84],
  [0x2026, 0x85],
  [0x2020, 0x86],
  [0x2021, 0x87],
  [0x02c6, 0x88],
  [0x2030, 0x89],
  [0x0160, 0x8a],
  [0x2039, 0x8b],
  [0x0152, 0x8c],
  [0x017d, 0x8e],
  [0x2018, 0x91],
  [0x2019, 0x92],
  [0x201c, 0x93],
  [0x201d, 0x94],
  [0x2022, 0x95],
  [0x2013, 0x96],
  [0x2014, 0x97],
  [0x02dc, 0x98],
  [0x2122, 0x99],
  [0x0161, 0x9a],
  [0x203a, 0x9b],
  [0x0153, 0x9c],
  [0x017e, 0x9e],
  [0x0178, 0x9f],
]);

function normalizeTranslation(value) {
  if (typeof value !== "string" || (!value.includes("à¤") && !value.includes("à¥"))) {
    return value;
  }

  const bytes = Uint8Array.from(
    Array.from(value, (character) => {
      const code = character.charCodeAt(0);
      return cp1252ReverseMap.get(code) ?? code;
    }),
  );

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return value;
  }
}

export const languages = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "hi", label: "हिन्दी", shortLabel: "HI" },
];

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window === "undefined") return defaultLanguage;
    return window.localStorage.getItem("kn-agro-language") || defaultLanguage;
  });
  const [dictionary, setDictionary] = useState({});

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = "ltr";
    window.localStorage.setItem("kn-agro-language", language);
  }, [language]);

  /**
   * The translation dictionary is a ~70KB module, and English needs none
   * of it: every t() key IS the English string, so `dictionary[key] || key`
   * below already returns the right text with an empty dictionary. Loading
   * it statically therefore charged every English-only visitor for bytes
   * they could never use, on the very first paint (this provider wraps the
   * whole app). It is fetched on demand instead, only for a language that
   * actually has an entry.
   *
   * A not-yet-arrived chunk is indistinguishable from a missing key, so
   * the brief window before it resolves degrades to English on its own —
   * no loading state or gating is needed. A failed fetch degrades the same
   * way rather than breaking the page.
   */
  useEffect(() => {
    if (language === defaultLanguage) {
      setDictionary({});
      return undefined;
    }

    // Guards against a slow fetch for a language the user has already
    // switched away from resolving last and winning.
    let isCurrent = true;

    import("./translations")
      .then((module) => {
        if (isCurrent) setDictionary(module.translations[language] || {});
      })
      .catch(() => {
        if (isCurrent) setDictionary({});
      });

    return () => {
      isCurrent = false;
    };
  }, [language]);

  const t = useMemo(
    () =>
      (key, values = {}) => {
        if (!key) return "";
        const translated = normalizeTranslation(dictionary[key] || key);

        return Object.entries(values).reduce(
          (text, [name, value]) => text.replaceAll(`{{${name}}}`, value),
          translated,
        );
      },
    [dictionary],
  );

  const value = useMemo(
    () => ({
      language,
      languages,
      setLanguage,
      t,
      isHindi: language === "hi",
    }),
    [language, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
