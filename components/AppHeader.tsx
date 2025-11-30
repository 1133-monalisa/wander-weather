'use client'
import Link from 'next/link'
import ThemeSwitcher from './ThemeSwitcher'

export default function AppHeader() {
  return (
    <header className="w-full border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <span className="text-xl font-bold">WanderWeather</span>
          </Link>
          <nav className="hidden md:flex gap-3 text-sm text-muted-foreground">
            <Link href="/search">Search</Link>
            <Link href="/planner">Planner</Link>
            <Link href="/dashboard">Dashboard</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <Link href="/auth/login" className="px-3 py-1 rounded-md border text-sm">
            Login
          </Link>
        </div>
      </div>
    </header>
  )
}
