
'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'

/**
 * Wrap your app (in app/layout.tsx) with this component:
 * <ThemeProviderClient>{children}</ThemeProviderClient>
 *
 * Uses `class` attribute so theme names become classes on <html>, e.g. <html class="theme-cold">
 * That lets your Tailwind/CSS tokens respond to theme classes.
 */
export default function ThemeProviderClient({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={['light', 'dark', 'cold', 'sunny', 'hot']}
    >
      {children}
    </ThemeProvider>
  )
}
