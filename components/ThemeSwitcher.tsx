// components/ThemeSwitcher.tsx
'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

const PRESET_THEMES = [
  { id: 'cold', label: '❄️ Cold' },
  { id: 'sunny', label: '☀️ Sunny' },
  { id: 'hot', label: '🔥 Hot' },
  { id: 'light', label: '🌤️ Light' },
  { id: 'dark', label: '🌙 Dark' }
]

export default function ThemeSwitcher() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch by rendering theme-dependent UI only on client
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // avoid rendering interactive theme UI on server
    return <div className="inline-block w-10 h-8" />
  }

  const activeTheme = theme ?? resolvedTheme ?? 'light'

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-2 bg-card rounded-full p-1 shadow-sm">
        {PRESET_THEMES.map((t) => {
          const active = activeTheme === t.id
          return (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              title={t.label}
              aria-pressed={active}
              className={
                'px-3 py-1 text-sm rounded-full transition ' +
                (active ? 'ring-2 ring-offset-1 ring-sky-400' : 'opacity-70 hover:opacity-100')
              }
            >
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
