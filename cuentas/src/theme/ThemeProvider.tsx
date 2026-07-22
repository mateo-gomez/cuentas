import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { useColorScheme } from "react-native"
import { storage } from "../helpers/storage"
import { themes } from "./index"
import type { Theme } from "./types"

export type ThemePref = "claro" | "oscuro" | "sepia" | "indigo" | "auto"

const PREFS: ThemePref[] = ["claro", "oscuro", "sepia", "indigo", "auto"]

type ThemeCtx = {
  theme: Theme // resolved concrete theme (never 'auto')
  pref: ThemePref // user selection incl. auto
  setPref: (p: ThemePref) => void
  ready: boolean // hydration done
}

const THEME_STORAGE_KEY = "theme.pref"

const ThemeContext = createContext<ThemeCtx | null>(null)

function resolve(
  pref: ThemePref,
  systemScheme: "light" | "dark" | null | undefined,
): Theme {
  if (pref === "auto") {
    return systemScheme === "dark" ? themes.oscuro : themes.claro
  }
  return themes[pref]
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme()
  // Default while loading: resolve Auto against the current system scheme so
  // first paint matches the OS and minimizes flash.
  const [pref, setPrefState] = useState<ThemePref>("auto")
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    storage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (cancelled) return
      if (stored && PREFS.includes(stored as ThemePref)) {
        setPrefState(stored as ThemePref)
      }
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Auto mode live-follows the OS scheme through `useColorScheme()`, which
  // already re-renders this provider on every system appearance change.

  const setPref = (p: ThemePref) => {
    setPrefState(p)
    storage.setItem(THEME_STORAGE_KEY, p)
  }

  const theme = useMemo(() => resolve(pref, systemScheme), [pref, systemScheme])

  const value = useMemo<ThemeCtx>(
    () => ({ theme, pref, setPref, ready }),
    [theme, pref, ready],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeCtx {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return ctx
}
