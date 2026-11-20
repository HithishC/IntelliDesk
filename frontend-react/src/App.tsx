
import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { User } from 'firebase/auth'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  BrainCircuit,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react'

import {
  loginUser,
  logoutUser,
  monitorAuthState,
} from './firebase/auth'

import MainLayout, {
  type PageName,
} from './layouts/MainLayout'

import Dashboard from './pages/Dashboard'
import RaiseComplaint from './pages/RaiseComplaint'
import Tickets from './pages/Tickets'
import Incidents from './pages/Incidents'
import Analytics from './pages/Analytics'
import Feedback from './pages/Feedback'


function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await loginUser(email.trim(), password)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''

      if (
        message.includes('auth/invalid-credential') ||
        message.includes('auth/wrong-password') ||
        message.includes('auth/user-not-found')
      ) {
        setError('Invalid email or password. Please try again.')
      } else if (message.includes('auth/invalid-email')) {
        setError('Please enter a valid email address.')
      } else if (message.includes('auth/too-many-requests')) {
        setError('Too many attempts. Please try again later.')
      } else {
        setError(message || 'Login failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b14] px-5 py-10 text-slate-100">

      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-violet-600/10 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-blue-500/15 text-cyan-400 shadow-lg shadow-blue-500/10">
            <BrainCircuit size={34} />
          </div>

          <h1 className="text-3xl font-bold tracking-tight">
            IntelliDesk<span className="text-blue-400">.</span>
          </h1>

          <p className="mt-2 text-xs tracking-[4px] text-slate-500">
            ZERITH AI INCIDENT INTELLIGENCE
          </p>
        </div>

        <div className="glass glow-blue p-7 sm:p-9">
          <div className="mb-7">
            <div className="mb-3 flex items-center gap-2 text-cyan-400">
              <ShieldCheck size={17} />
              <span className="text-[10px] font-semibold tracking-[2px]">
                SECURE ACCESS
              </span>
            </div>

            <h2 className="text-2xl font-bold">
              Welcome back.
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Sign in to access your AI operations center.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Email Address
              </label>

              <div className="flex items-center rounded-xl border border-white/10 bg-[#080b14]/70 px-4 transition focus-within:border-blue-400/50">
                <Mail size={17} className="shrink-0 text-slate-500" />

                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-transparent px-3 py-4 text-sm text-white outline-none placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                Password
              </label>

              <div className="flex items-center rounded-xl border border-white/10 bg-[#080b14]/70 px-4 transition focus-within:border-blue-400/50">
                <LockKeyhole size={17} className="shrink-0 text-slate-500" />

                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-transparent px-3 py-4 text-sm text-white outline-none placeholder:text-slate-600"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-500 hover:text-white"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-semibold shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Authenticating...' : 'Sign In to IntelliDesk'}

              {!loading && <ArrowUpRight size={17} />}
            </button>
          </form>

          <div className="mt-7 flex items-center justify-center gap-2 border-t border-white/[0.07] pt-5 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-emerald-400" />
            Secured with Firebase Authentication
          </div>
        </div>

        <p className="mt-7 text-center text-xs text-slate-600">
          INTELLIDESK · DEVELOPED BY ZERITH
        </p>
      </motion.div>
    </div>
  )
}


function App() {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [activePage, setActivePage] = useState<PageName>('dashboard')

  useEffect(() => {
    const unsubscribe = monitorAuthState((currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })

    return unsubscribe
  }, [])

  async function handleLogout() {
    try {
      await logoutUser()
      setActivePage('dashboard')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  function renderPage() {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />

      case 'raise-complaint':
        return (
          <RaiseComplaint
            onNavigate={setActivePage}
          />
        )

      case 'tickets':
        return <Tickets />

      case 'incidents':
        return <Incidents />

      case 'analytics':
        return <Analytics />

      case 'feedback':
        return <Feedback />

      default:
        return <Dashboard />
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080b14] text-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-blue-500/20 border-t-cyan-400" />

          <p className="text-sm text-slate-400">
            Verifying secure session...
          </p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return (
    <MainLayout
      activePage={activePage}
      onNavigate={setActivePage}
      onLogout={handleLogout}
      userEmail={user.email || ''}
    >
      {renderPage()}
    </MainLayout>
  )
}

export default App
