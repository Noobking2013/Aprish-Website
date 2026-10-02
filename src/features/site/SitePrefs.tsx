import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CLINIC_TYPES, LOCALES, getContent, type ClinicId, type ClinicType, type Content, type Locale } from "@/content/content";

interface PlanRequest {
  name: string;
  price: number;
  /** Bumped on every request, so asking for the same plan twice still re-seeds the ROI. */
  nonce: number;
}

interface SitePrefsValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  content: Content;
  clinic: ClinicType;
  setClinicId: (id: ClinicId) => void;
  planRequest: PlanRequest | null;
  requestPlanBreakEven: (name: string, price: number) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
}

const SitePrefsContext = createContext<SitePrefsValue | null>(null);

/** In-memory only, by design: no localStorage, so a refresh returns to the defaults. */
export function SitePrefsProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const [clinicId, setClinicId] = useState<ClinicId>("general");
  const [planRequest, setPlanRequest] = useState<PlanRequest | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const lang = LOCALES.find((l) => l.id === locale)?.htmlLang ?? "en-IN";
    document.documentElement.lang = lang;
  }, [locale]);

  const requestPlanBreakEven = useCallback((name: string, price: number) => {
    setPlanRequest((prev) => ({ name, price, nonce: (prev?.nonce ?? 0) + 1 }));
  }, []);

  const value = useMemo<SitePrefsValue>(
    () => ({
      locale,
      setLocale,
      content: getContent(locale),
      clinic: CLINIC_TYPES.find((c) => c.id === clinicId) ?? CLINIC_TYPES[0],
      setClinicId,
      planRequest,
      requestPlanBreakEven,
      searchOpen,
      setSearchOpen,
    }),
    [locale, clinicId, planRequest, requestPlanBreakEven, searchOpen],
  );

  return <SitePrefsContext.Provider value={value}>{children}</SitePrefsContext.Provider>;
}

const FALLBACK: SitePrefsValue = {
  locale: "en",
  setLocale: () => {},
  content: getContent("en"),
  clinic: CLINIC_TYPES[0],
  setClinicId: () => {},
  planRequest: null,
  requestPlanBreakEven: () => {},
  searchOpen: false,
  setSearchOpen: () => {},
};

/** Falls back to English defaults outside the provider, so sections render in isolation (checks, Storybook). */
export function useSitePrefs(): SitePrefsValue {
  return useContext(SitePrefsContext) ?? FALLBACK;
}

export function useContent(): Content {
  return useSitePrefs().content;
}
