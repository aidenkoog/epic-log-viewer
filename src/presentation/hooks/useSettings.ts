import { useEffect, useState } from 'react'
import type { AnalyzerSettings } from '../../domain/settings.ts'
import { makeDefaultSettings } from '../../domain/settings'

const LS_KEY = 'logviz:settings:v1'

export function useSettings(): [AnalyzerSettings, (updater: (s: AnalyzerSettings) => AnalyzerSettings) => void] {
  const [settings, setSettings] = useState<AnalyzerSettings>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      if (raw) return JSON.parse(raw) as AnalyzerSettings
    } catch { }
    return makeDefaultSettings()
  })

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(settings)) } catch { }
  }, [settings])

  const update = (updater: (s: AnalyzerSettings) => AnalyzerSettings) => {
    setSettings(prev => updater(prev))
  }

  return [settings, update]
}
