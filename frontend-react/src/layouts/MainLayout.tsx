
import { useState } from 'react'
import {
  Activity,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Command,
  FilePlus2,
  LayoutDashboard,
  Menu,
  MessageSquareText,
  Search,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
  X,
  LogOut,
  Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type PageName =
  | 'dashboard'
  | 'raise-complaint'
  | 'tickets'
  | 'incidents'
  | 'analytics'
  | 'feedback'

interface MainLayoutProps {
  children: React.ReactNode
  activePage: PageName
  onNavigate: (page: PageName) => void
  onLogout: () => void
  userEmail?: string
}

const navigation = [
  {
    section: 'WORKSPACE',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'raise-complaint', label: 'Raise Complaint', icon: FilePlus2 },
      { id: 'tickets', label: 'Ticket Management', icon: Ticket },
      { id: 'incidents', label: 'Incident Intelligence', icon: Activity },
    ],
  },
  {
    section: 'INTELLIGENCE',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'feedback', label: 'Feedback Center', icon: MessageSquareText },
    ],
  },
]

export default function MainLayout({
  children,
  activePage,
  onNavigate,
  onLogout,
  userEmail,
}: MainLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const activeLabel =
    navigation.flatMap((group) => group.items).find(
      (item) => item.id === activePage
    )?.label ?? 'Dashboard'

  const handleNavigate = (page: PageName) => {
    onNavigate(page)
    setMobileOpen(false)
  }

  const sidebarContent = (
    <>
      <div className="flex h-[76px] items-center gap-3 border-b border-white/[0.07] px-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-blue-500/20">
          <ShieldCheck size={22} className="text-white" />
        </div>

        {!collapsed && (
          <div className="min-w-0">
            <h1 className="text-lg font-bold tracking-wide text-white">
              Intelli<span className="text-cyan-400">Desk</span>
            </h1>
            <p className="text-[9px] tracking-[2px] text-slate-500">
              AI INCIDENT INTELLIGENCE
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-6">
        {navigation.map((group) => (
          <div key={group.section} className="mb-7">
            {!collapsed && (
              <p className="mb-3 px-3 text-[10px] font-bold tracking-[2px] text-slate-600">
                {group.section}
              </p>
            )}

            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const active = activePage === item.id

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigate(item.id as PageName)}
                    title={collapsed ? item.label : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200 ${
                      active
                        ? 'bg-cyan-400/[0.12] text-cyan-300'
                        : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.div
                        layoutId="active-nav"
                        className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-cyan-400"
                      />
                    )}

                    <Icon
                      size={19}
                      className={`shrink-0 ${
                        active
                          ? 'text-cyan-300'
                          : 'text-slate-500 group-hover:text-slate-200'
                      }`}
                    />

                    {!collapsed && (
                      <span className="text-[13px] font-medium">
                        {item.label}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/[0.07] p-3">
        <div
          className={`mb-3 flex items-center gap-3 rounded-xl bg-white/[0.035] p-3 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-600 text-xs font-bold text-white">
            {userEmail?.charAt(0).toUpperCase() || 'U'}
          </div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                Administrator
              </p>
              <p className="truncate text-[10px] text-slate-500">
                {userEmail || 'Signed in'}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
          title="Logout"
        >
          <LogOut size={18} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-[#080b14] text-slate-100">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <motion.aside
          animate={{ width: collapsed ? 76 : 260 }}
          transition={{ duration: 0.2 }}
          className="relative hidden shrink-0 flex-col border-r border-white/[0.07] bg-[#0b1020] lg:flex"
        >
          {sidebarContent}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute -right-3 top-[88px] z-20 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-[#172033] text-slate-400 transition hover:text-cyan-300"
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <ChevronRight size={15} />
            ) : (
              <ChevronLeft size={15} />
            )}
          </button>
        </motion.aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="fixed inset-0 z-40 bg-black/70 lg:hidden"
              />

              <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                exit={{ x: -280 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col border-r border-white/10 bg-[#0b1020] lg:hidden"
              >
                <div className="absolute right-3 top-5 z-10">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-white/10"
                  >
                    <X size={19} />
                  </button>
                </div>
                {sidebarContent}
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-white/[0.07] bg-[#080b14]/90 px-4 backdrop-blur-xl sm:px-7">
            <div className="flex min-w-0 items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu size={21} />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Command size={14} className="text-cyan-400" />
                  <span className="truncate text-sm font-semibold text-white">
                    {activeLabel}
                  </span>
                </div>
                <p className="mt-1 hidden text-[10px] tracking-wide text-slate-500 sm:block">
                  INTELLIDESK / COMMAND CENTER
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 py-2 md:flex">
                <Search size={14} className="text-slate-500" />
                <span className="text-xs text-slate-500">
                  AI Intelligence Platform
                </span>
              </div>

              <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2.5 py-1.5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="text-[10px] font-medium text-emerald-300">
                  SYSTEM ONLINE
                </span>
              </div>

              <button
                className="relative rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                aria-label="Notifications"
              >
                <Bell size={18} />
                <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-cyan-400" />
              </button>

              <button
                className="hidden rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white sm:block"
                aria-label="Settings"
              >
                <Settings size={18} />
              </button>
            </div>
          </header>

          <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activePage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>

            <footer className="mt-12 flex flex-col justify-between gap-2 border-t border-white/[0.06] py-5 text-[10px] text-slate-600 sm:flex-row">
              <span>© 2026 INTELLIDESK · TEAM ZERITH</span>
              <span className="flex items-center gap-1">
                <Zap size={11} className="text-cyan-400" />
                POWERED BY AI INCIDENT INTELLIGENCE
              </span>
            </footer>
          </div>
        </main>
      </div>
    </div>
  )
}
