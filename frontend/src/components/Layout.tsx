import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BarChart2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GitCompare,
  LayoutDashboard,
  Menu,
  Calculator,
  Moon,
  Network,
  Newspaper,
  Scale,
  Sparkles,
  Sun,
  Table2,
  TrendingUp,
  Trophy,
  X,
} from 'lucide-react'
import { useTheme } from '../hooks/useTheme'
import { modelsData } from '../data/loader'

interface NavItem {
  path: string
  icon: React.ElementType
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { path: '/',           icon: LayoutDashboard, label: 'Overview'   },
  { path: '/compare',    icon: GitCompare,       label: 'Compare'    },
  { path: '/benchmarks', icon: BarChart2,        label: 'Benchmarks' },
  { path: '/trends',     icon: TrendingUp,       label: 'Trends'     },
  { path: '/clusters',   icon: Network,          label: 'Clusters'   },
  { path: '/tradeoffs',  icon: Scale,            label: 'Tradeoffs'  },
  { path: '/rankings',   icon: Trophy,           label: 'Rankings'   },
  { path: '/explorer',   icon: Table2,           label: 'Explorer'   },
  { path: '/quiz',       icon: Sparkles,         label: 'Find My Model'    },
  { path: '/cost',       icon: Calculator,       label: 'Cost Calculator'  },
  { path: '/news',       icon: Newspaper,        label: 'Top News'         },
  { path: '/making',     icon: BookOpen,         label: 'Making'           },
]

interface LayoutProps {
  children: React.ReactNode
}

function HexLogo() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      <path
        d="M 25,14 L 19.5,23.5 L 8.5,23.5 L 3,14 L 8.5,4.5 L 19.5,4.5 Z"
        stroke="var(--accent-red)"
        strokeWidth="1.5"
        fill="var(--accent-red)"
        fillOpacity="0.12"
      />
      <text
        x="14"
        y="18"
        textAnchor="middle"
        fontSize="9"
        fontWeight="700"
        fill="var(--accent-red)"
        fontFamily="Inter, sans-serif"
        letterSpacing="-0.5"
      >
        LA
      </text>
    </svg>
  )
}

function SidebarContent({
  onClose,
  collapsed,
}: {
  onClose?: () => void
  collapsed: boolean
}) {
  const { pathname } = useLocation()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-[var(--border)]">
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity min-w-0"
        >
          <HexLogo />
          <div
            className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
              collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
            }`}
          >
            <div className="font-bold text-primary text-sm leading-tight">LLMs Assemble</div>
            <div className="text-xs text-muted mt-0.5">Choose &amp; Play Yours</div>
          </div>
        </Link>
        {onClose && (
          <button
            type="button"
            title="Close menu"
            onClick={onClose}
            className="text-muted hover:text-primary lg:hidden ml-2 flex-shrink-0"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const active = pathname === path
          return (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              title={collapsed ? label : undefined}
              className={[
                'flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-colors duration-150',
                active
                  ? 'bg-[#E63946]/10 text-[#E63946] border-l-2 border-[#E63946]'
                  : 'text-muted hover:text-primary hover:bg-[var(--border)]',
              ].join(' ')}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span
                className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${
                  collapsed ? 'max-w-0 opacity-0' : 'max-w-[200px] opacity-100'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

function Topbar({
  onMenuClick,
  label,
  theme,
  onToggleTheme,
}: {
  onMenuClick: () => void
  label: string
  theme: 'dark' | 'light'
  onToggleTheme: () => void
}) {
  return (
    <div className="h-14 border-b border-[var(--border)] bg-sidebar/80 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          title="Open menu"
          onClick={onMenuClick}
          className="lg:hidden text-muted hover:text-primary mr-1"
        >
          <Menu size={20} />
        </button>
        <span className="text-sm font-medium text-primary">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="p-2 rounded-lg border border-[var(--border)] text-muted hover:text-primary hover:bg-[var(--border)] transition-colors"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <span className="hidden sm:inline text-xs text-muted bg-border/50 px-3 py-1 rounded-full">
          {modelsData.length} models · 2025 Data
        </span>
      </div>
    </div>
  )
}

export default function Layout({ children }: LayoutProps) {
  const { pathname } = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('llms-sidebar-collapsed') === 'true'
  )
  const { theme, toggleTheme } = useTheme()

  const currentLabel =
    NAV_ITEMS.find((n) => n.path === pathname)?.label ?? 'Overview'

  function toggleCollapsed() {
    setSidebarCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('llms-sidebar-collapsed', String(next))
      return next
    })
  }

  return (
    <div className="min-h-screen bg-base">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-full bg-sidebar border-r border-[var(--border)] z-20 overflow-visible transition-[width] duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-[60px]' : 'w-[240px]'
        }`}
      >
        <SidebarContent collapsed={sidebarCollapsed} />
        {/* Collapse toggle button */}
        <button
          type="button"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          onClick={toggleCollapsed}
          className="absolute right-[-12px] top-[72px] w-6 h-6 rounded-full bg-sidebar border border-[var(--border)] text-muted hover:text-primary flex items-center justify-center shadow-sm z-30"
        >
          {sidebarCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed left-0 top-0 w-[240px] h-full bg-sidebar border-r border-[var(--border)] flex flex-col z-50">
            <SidebarContent collapsed={false} onClose={() => setMobileOpen(false)} />
          </aside>
        </>
      )}

      {/* Main content */}
      <div
        className={`min-h-screen transition-[margin] duration-300 ease-in-out ${
          sidebarCollapsed ? 'lg:ml-[60px]' : 'lg:ml-[240px]'
        }`}
      >
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          label={currentLabel}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
