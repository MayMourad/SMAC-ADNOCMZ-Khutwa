/**
 * Language context
 * ================
 *
 * `<LanguageProvider>` wraps the app (in src/app/_layout.tsx). Screens use:
 *
 *   const { t, lang, setLang, isRTL } = useLang();
 *   t('home.khutwaScore')                     -> "Khutwa Score" / "نقاط خُطوة"
 *   t('stories.progress', { n: 3, total: 8 }) -> "3 of 8 …"
 *
 * The choice persists to AsyncStorage. We do a **soft** RTL: text direction and
 * alignment flip for Arabic (handled in ThemedText), and rows that matter flip
 * via `isRTL`, but we do NOT call I18nManager.forceRTL — that needs a full app
 * reload, which is jarring mid-demo. Good enough for the MVP; note it in the Q&A.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { LANGUAGES, STRINGS, type Lang } from './strings';

export { LANGUAGES };
export type { Lang };

const STORAGE_KEY = 'khutwa.lang';

/** Story language code for services/llm.ts. */
export const storyLang = (lang: Lang): 'en-AE' | 'ar-AE' =>
  lang === 'ar' ? 'ar-AE' : 'en-AE';

interface LanguageValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Translate a key, filling `{placeholder}` tokens. Falls back to English, then the key. */
  t: (key: string, vars?: Record<string, string | number>) => string;
  isRTL: boolean;
  /** 'rtl' | 'ltr' — handy for `writingDirection`. */
  dir: 'rtl' | 'ltr';
  /** 'right' | 'left' — natural text alignment for the current language. */
  align: 'right' | 'left';
}

const LanguageContext = createContext<LanguageValue | null>(null);

function interpolate(str: string, vars?: Record<string, string | number>): string {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (v === 'en' || v === 'ar') setLangState(v);
      })
      .catch(() => {});
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    AsyncStorage.setItem(STORAGE_KEY, l).catch(() => {});
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const table = STRINGS[lang] ?? STRINGS.en;
      const raw = table[key] ?? STRINGS.en[key] ?? key;
      return interpolate(raw, vars);
    },
    [lang],
  );

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      setLang,
      t,
      isRTL: lang === 'ar',
      dir: lang === 'ar' ? 'rtl' : 'ltr',
      align: lang === 'ar' ? 'right' : 'left',
    }),
    [lang, setLang, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLang must be used inside <LanguageProvider>');
  }
  return ctx;
}
