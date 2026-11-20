
import { useEffect, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Cpu,
  RefreshCw,
  Ticket,
  TrendingUp,
  Zap,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { fetchDashboardStats, type DashboardStats } from '../api/dashboard'
import { fetchTickets, type Ticket as TicketType } from '../api/tickets'

const COLORS = ['#22d3ee', '#818cf8', '#a78bfa', '#34d399', '#f59e0b']

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  color: string
}) {
  return (
    <div className="glass group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:border-cyan-400/20">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">{title}</p>
          <h3 className="mt-3 text-3xl font-bold tracking-tight text-white">
            {value}
          </h3>
          <p className="mt-2 text-[11px] text-slate-500">{subtitle}</p>
        </div>
        <div
          className="rounded-xl p-3"
          style={{ backgroundColor: `${color}18`, color }}
        >
          <Icon size={21} />
        </div>
      </div>
      <div
        className="absolute -bottom-10 -right-5 h-24 w-24 rounded-full opacity-[0.07] blur-2xl"
        style={{ backgroundColor: color }}
      />
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Open: 'bg-blue-400/10 text-blue-300 border-blue-400/20',
    'In Progress': 'bg-amber-400/10 text-amber-300 border-amber-400/20',
    Resolved: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
    Closed: 'bg-slate-400/10 text-slate-300 border-slate-400/20',
  }

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
        styles[status] || styles.Open
      }`}
    >
      {status}
    </span>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDashboard() {
    try {
      setLoading(true)
      setError('')

      const [statsData, ticketsData] = await Promise.all([
        fetchDashboardStats(),
        fetchTickets(),
      ])

      setStats(statsData)
      setTickets(ticketsData.tickets || [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load dashboard data'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <RefreshCw size={30} className="animate-spin text-cyan-400" />
        <p className="text-sm text-slate-400">
          Loading intelligence dashboard...
        </p>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="glass flex min-h-[300px] flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertTriangle size={32} className="text-red-400" />
        <h2 className="text-lg font-semibold text-white">
          Dashboard unavailable
        </h2>
        <p className="max-w-md text-sm text-slate-400">
          {error || 'No dashboard data is available.'}
        </p>
        <button
          onClick={() => void loadDashboard()}
          className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      </div>
    )
  }

  const statusData = Object.entries(stats.tickets_by_status || {}).map(
    ([name, value]) => ({ name, value })
  )

  const priorityData = Object.entries(stats.tickets_by_priority || {}).map(
    ([name, value]) => ({ name, value })
  )

  const categoryData = Object.entries(stats.tickets_by_category || {}).map(
    ([name, value]) => ({ name, value })
  )

  const recentTickets = [...tickets].slice(0, 6)

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
            <span className="text-[10px] font-bold tracking-[2px] text-cyan-400">
              LIVE INTELLIGENCE OVERVIEW
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Command Center
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Monitor complaints, incidents and AI-powered resolutions.
          </p>
        </div>

        <button
          onClick={() => void loadDashboard()}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300"
        >
          <RefreshCw size={14} />
          Refresh Data
        </button>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="TOTAL TICKETS"
          value={stats.total_tickets}
          subtitle="All registered complaints"
          icon={Ticket}
          color="#22d3ee"
        />
        <MetricCard
          title="OPEN TICKETS"
          value={stats.open_tickets}
          subtitle="Awaiting action"
          icon={Clock3}
          color="#818cf8"
        />
        <MetricCard
          title="CRITICAL TICKETS"
          value={stats.critical_tickets}
          subtitle="Requiring urgent attention"
          icon={AlertTriangle}
          color="#fb7185"
        />
        <MetricCard
          title="RESOLUTION RATE"
          value={`${stats.resolution_rate}%`}
          subtitle="Backend calculated rate"
          icon={TrendingUp}
          color="#34d399"
        />
      </div>

      {/* AI Status */}
      <div className="glass relative overflow-hidden p-5 sm:p-6">
        <div className="absolute -right-16 -top-24 h-56 w-56 rounded-full bg-blue-500/[0.08] blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-300">
              <Cpu size={25} />
            </div>
            <div>
              <h2 className="font-semibold text-white">
                AI Intelligence Engine
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Automated complaint analysis and incident intelligence
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-5">
            <div>
              <p className="text-xl font-bold text-emerald-400">
                {stats.ai_analysis_completed}
              </p>
              <p className="text-[10px] text-slate-500">COMPLETED</p>
            </div>
            <div>
              <p className="text-xl font-bold text-amber-400">
                {stats.ai_analysis_pending}
              </p>
              <p className="text-[10px] text-slate-500">PENDING</p>
            </div>
            <div>
              <p className="text-xl font-bold text-red-400">
                {stats.ai_analysis_unavailable}
              </p>
              <p className="text-[10px] text-slate-500">UNAVAILABLE</p>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="glass flex items-center gap-4 p-5">
          <div className="rounded-xl bg-violet-400/10 p-3 text-violet-300">
            <Activity size={23} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {stats.total_incidents}
            </p>
            <p className="text-xs text-slate-400">Detected Incident Groups</p>
          </div>
          <ArrowUpRight className="ml-auto text-slate-600" size={18} />
        </div>

        <div className="glass flex items-center gap-4 p-5">
          <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
            <CheckCircle2 size={23} />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {stats.resolved_tickets + stats.closed_tickets}
            </p>
            <p className="text-xs text-slate-400">Resolved or Closed Tickets</p>
          </div>
          <ArrowUpRight className="ml-auto text-slate-600" size={18} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="glass p-5">
          <div className="mb-5">
            <h2 className="font-semibold text-white">Ticket Status</h2>
            <p className="mt-1 text-xs text-slate-500">
              Distribution by current status
            </p>
          </div>

          {statusData.length ? (
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="h-[220px] w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={58}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {statusData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#111827',
                        border: '1px solid #334155',
                        borderRadius: 10,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full space-y-3 sm:w-1/2">
                {statusData.map((item, index) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 text-slate-400">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      {item.name}
                    </div>
                    <span className="font-semibold text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">
              No status data available
            </p>
          )}
        </div>

        <div className="glass p-5">
          <div className="mb-5">
            <h2 className="font-semibold text-white">Ticket Priority</h2>
            <p className="mt-1 text-xs text-slate-500">
              Complaint urgency distribution
            </p>
          </div>

          {priorityData.length ? (
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={priorityData}
                  margin={{ top: 10, right: 5, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#111827',
                      border: '1px solid #334155',
                      borderRadius: 10,
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#22d3ee"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-slate-500">
              No priority data available
            </p>
          )}
        </div>
      </div>

      {/* Category Chart */}
      <div className="glass p-5">
        <div className="mb-5">
          <h2 className="font-semibold text-white">Complaint Categories</h2>
          <p className="mt-1 text-xs text-slate-500">
            Distribution of classified complaint categories
          </p>
        </div>

        {categoryData.length ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: '#111827',
                    border: '1px solid #334155',
                    borderRadius: 10,
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#818cf8"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-slate-500">
            No category data available
          </p>
        )}
      </div>

      {/* Recent Tickets */}
      <div className="glass overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
          <div>
            <h2 className="font-semibold text-white">Recent Tickets</h2>
            <p className="mt-1 text-xs text-slate-500">
              Latest complaints received by the system
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-cyan-400">
            <Activity size={14} />
            Live data
          </div>
        </div>

        {recentTickets.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-white/[0.05] text-[10px] tracking-wider text-slate-500">
                  <th className="px-5 py-4 font-medium">TICKET ID</th>
                  <th className="px-5 py-4 font-medium">COMPLAINT</th>
                  <th className="px-5 py-4 font-medium">CATEGORY</th>
                  <th className="px-5 py-4 font-medium">STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr
                    key={ticket.ticket_id}
                    className="border-b border-white/[0.04] transition hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-4 font-mono text-xs text-cyan-300">
                      {ticket.ticket_id.slice(0, 8)}
                    </td>
                    <td className="max-w-[280px] px-5 py-4">
                      <p className="truncate text-xs text-slate-300">
                        {ticket.complaint}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {ticket.ai_analysis?.category || 'Unclassified'}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={ticket.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-12 text-slate-500">
            <Ticket size={25} />
            <p className="text-sm">No tickets found</p>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <Zap size={13} className="text-cyan-400" />
        Dashboard statistics are retrieved from the IntelliDesk backend.
      </div>
    </div>
  )
}
