
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldAlert,
  Target,
  Ticket,
  TrendingUp,
  Zap,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  fetchDashboardStats,
  type DashboardStats,
} from '../api/dashboard'

const CHART_COLORS = [
  '#22d3ee',
  '#818cf8',
  '#a78bfa',
  '#34d399',
  '#fbbf24',
  '#fb7185',
  '#38bdf8',
  '#c084fc',
]

const tooltipStyle = {
  backgroundColor: '#101a2c',
  border: '1px solid rgba(148,163,184,0.15)',
  borderRadius: '12px',
  color: '#f1f5f9',
  fontSize: '11px',
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  color,
  background,
}: {
  label: string
  value: string | number
  description: string
  icon: typeof Activity
  color: string
  background: string
}) {
  return (
    <div className="glass p-5 transition duration-300 hover:border-cyan-400/20">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold tracking-[1.4px] text-slate-500">
          {label}
        </p>
        <div className={`rounded-xl p-2.5 ${background} ${color}`}>
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-white">{value}</p>

      <p className="mt-2 text-[11px] text-slate-500">
        {description}
      </p>
    </div>
  )
}

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="glass min-w-0 p-5">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-white">{title}</h2>
        <p className="mt-1 text-[10px] text-slate-500">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function EmptyChart() {
  return (
    <div className="flex h-[230px] items-center justify-center">
      <div className="text-center">
        <Activity size={25} className="mx-auto text-slate-600" />
        <p className="mt-3 text-xs text-slate-500">
          No data available yet
        </p>
      </div>
    </div>
  )
}

export default function Analytics() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAnalytics() {
    try {
      setLoading(true)
      setError('')

      const response = await fetchDashboardStats()
      setStats(response)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load analytics data.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAnalytics()
  }, [])

  const priorityData = useMemo(
    () =>
      Object.entries(stats?.tickets_by_priority || {}).map(
        ([name, value]) => ({ name, value })
      ),
    [stats]
  )

  const categoryData = useMemo(
    () =>
      Object.entries(stats?.tickets_by_category || {}).map(
        ([name, value]) => ({ name, value })
      ),
    [stats]
  )

  const statusData = useMemo(
    () =>
      Object.entries(stats?.tickets_by_status || {}).map(
        ([name, value]) => ({ name, value })
      ),
    [stats]
  )

  const aiData = useMemo(
    () => [
      {
        name: 'Completed',
        value: stats?.ai_analysis_completed || 0,
      },
      {
        name: 'Pending',
        value: stats?.ai_analysis_pending || 0,
      },
      {
        name: 'Unavailable',
        value: stats?.ai_analysis_unavailable || 0,
      },
    ],
    [stats]
  )

  const aiTotal = aiData.reduce((sum, item) => sum + item.value, 0)

  const resolutionRate = Number(stats?.resolution_rate || 0)

  const aiCompletionRate =
    aiTotal > 0
      ? (aiData[0].value / aiTotal) * 100
      : 0

  const priorityTotal = priorityData.reduce(
    (sum, item) => sum + item.value,
    0
  )

  const categoryTotal = categoryData.reduce(
    (sum, item) => sum + item.value,
    0
  )

  const statusTotal = statusData.reduce(
    (sum, item) => sum + item.value,
    0
  )

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
            <span className="text-[10px] font-bold tracking-[2px] text-violet-400">
              SYSTEM ANALYTICS
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Analytics & Intelligence
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Understand complaint trends, incident priorities and AI
            processing performance.
          </p>
        </div>

        <button
          onClick={() => void loadAnalytics()}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300 disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh Analytics
        </button>
      </div>

      {/* API Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-xs text-red-300">
          <AlertCircle size={16} className="shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            onClick={() => void loadAnalytics()}
            className="underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="glass flex min-h-[400px] flex-col items-center justify-center gap-3">
          <RefreshCw
            size={30}
            className="animate-spin text-cyan-400"
          />
          <p className="text-xs text-slate-400">
            Analyzing system performance...
          </p>
        </div>
      ) : stats ? (
        <>
          {/* Main Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label="TOTAL TICKETS"
              value={stats.total_tickets}
              description="All submitted complaints"
              icon={Ticket}
              color="text-cyan-300"
              background="bg-cyan-400/10"
            />

            <MetricCard
              label="RESOLUTION RATE"
              value={`${resolutionRate.toFixed(1)}%`}
              description="Backend-reported resolution rate"
              icon={Target}
              color="text-emerald-300"
              background="bg-emerald-400/10"
            />

            <MetricCard
              label="CRITICAL TICKETS"
              value={stats.critical_tickets}
              description="Tickets requiring urgent attention"
              icon={ShieldAlert}
              color="text-red-300"
              background="bg-red-400/10"
            />

            <MetricCard
              label="TOTAL INCIDENTS"
              value={stats.total_incidents}
              description="Grouped related incidents"
              icon={Activity}
              color="text-violet-300"
              background="bg-violet-400/10"
            />
          </div>

          {/* Resolution and AI Performance */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <div className="glass p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    Resolution Performance
                  </h2>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Backend-reported resolution rate
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-400/10 p-3 text-emerald-300">
                  <TrendingUp size={20} />
                </div>
              </div>

              <div className="mt-7 flex flex-col items-center justify-center">
                <div
                  className="relative flex h-44 w-44 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#34d399 ${Math.max(0, Math.min(100, resolutionRate)) * 3.6}deg, #1e293b 0deg)`,
                  }}
                >
                  <div className="flex h-36 w-36 flex-col items-center justify-center rounded-full bg-[#101827]">
                    <span className="text-3xl font-bold text-white">
                      {resolutionRate.toFixed(1)}%
                    </span>
                    <span className="mt-1 text-[9px] tracking-wider text-slate-500">
                      RESOLUTION
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid w-full grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white/[0.025] p-3 text-center">
                    <p className="text-xl font-bold text-emerald-300">
                      {stats.resolved_tickets}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Resolved
                    </p>
                  </div>

                  <div className="rounded-xl bg-white/[0.025] p-3 text-center">
                    <p className="text-xl font-bold text-slate-300">
                      {stats.closed_tickets}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="glass p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-white">
                    AI Processing Performance
                  </h2>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Analysis execution status
                  </p>
                </div>
                <div className="rounded-xl bg-violet-400/10 p-3 text-violet-300">
                  <BrainCircuit size={20} />
                </div>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      AI completion rate
                    </span>
                    <span className="text-xs font-bold text-cyan-300">
                      {aiCompletionRate.toFixed(1)}%
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 transition-all"
                      style={{
                        width: `${aiCompletionRate}%`,
                      }}
                    />
                  </div>
                </div>

                {[
                  {
                    label: 'Completed',
                    value: stats.ai_analysis_completed,
                    color: 'bg-emerald-400',
                    text: 'text-emerald-300',
                    icon: CheckCircle2,
                  },
                  {
                    label: 'Pending',
                    value: stats.ai_analysis_pending,
                    color: 'bg-amber-400',
                    text: 'text-amber-300',
                    icon: Clock3,
                  },
                  {
                    label: 'Unavailable',
                    value: stats.ai_analysis_unavailable,
                    color: 'bg-red-400',
                    text: 'text-red-300',
                    icon: AlertCircle,
                  },
                ].map((item) => {
                  const Icon = item.icon

                  return (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className={item.text}>
                          <Icon size={17} />
                        </span>
                        <span className="text-xs text-slate-300">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {item.value}
                      </span>
                    </div>
                  )
                })}

                <div className="rounded-xl border border-violet-400/10 bg-violet-400/[0.04] p-3">
                  <p className="text-[10px] text-violet-300">
                    AI ANALYSIS ENGINE
                  </p>
                  <p className="mt-1 text-xs text-slate-300">
                    Local Ollama-powered complaint analysis
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Priority and Status Charts */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ChartCard
              title="Ticket Priority Distribution"
              subtitle="Complaints classified by priority"
            >
              {priorityTotal === 0 ? (
                <EmptyChart />
              ) : (
                <>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={priorityData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                        >
                          {priorityData.map((item, index) => (
                            <Cell
                              key={item.name}
                              fill={
                                CHART_COLORS[index % CHART_COLORS.length]
                              }
                            />
                          ))}
                        </Pie>

                        <Tooltip contentStyle={tooltipStyle} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex flex-wrap justify-center gap-x-5 gap-y-3">
                    {priorityData.map((item, index) => (
                      <div
                        key={item.name}
                        className="flex items-center gap-2"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              CHART_COLORS[index % CHART_COLORS.length],
                          }}
                        />
                        <span className="text-[10px] text-slate-400">
                          {item.name}: {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </ChartCard>

            <ChartCard
              title="Ticket Status Distribution"
              subtitle="Current workflow status breakdown"
            >
              {statusTotal === 0 ? (
                <EmptyChart />
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={statusData}
                      margin={{
                        top: 10,
                        right: 10,
                        left: -20,
                        bottom: 10,
                      }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#263247"
                        vertical={false}
                      />

                      <XAxis
                        dataKey="name"
                        tick={{
                          fill: '#94a3b8',
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <YAxis
                        allowDecimals={false}
                        tick={{
                          fill: '#64748b',
                          fontSize: 10,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />

                      <Tooltip contentStyle={tooltipStyle} />

                      <Bar
                        dataKey="value"
                        name="Tickets"
                        radius={[6, 6, 0, 0]}
                      >
                        {statusData.map((item, index) => (
                          <Cell
                            key={item.name}
                            fill={
                              CHART_COLORS[index % CHART_COLORS.length]
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </ChartCard>
          </div>

          {/* Category Chart */}
          <ChartCard
            title="Complaint Category Analysis"
            subtitle="Distribution of classified complaint categories"
          >
            {categoryTotal === 0 ? (
              <EmptyChart />
            ) : (
              <div className="h-[310px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryData}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: 25,
                      left: 10,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#263247"
                      horizontal={false}
                    />

                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{
                        fill: '#64748b',
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      type="category"
                      dataKey="name"
                      width={95}
                      tick={{
                        fill: '#94a3b8',
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip contentStyle={tooltipStyle} />

                    <Bar
                      dataKey="value"
                      name="Complaints"
                      fill="#22d3ee"
                      radius={[0, 6, 6, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          {/* AI Status Chart */}
          <ChartCard
            title="AI Analysis Status Breakdown"
            subtitle="Distribution of AI processing outcomes"
          >
            {aiTotal === 0 ? (
              <EmptyChart />
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={aiData}
                    margin={{
                      top: 10,
                      right: 15,
                      left: -20,
                      bottom: 5,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="aiGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#818cf8"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="100%"
                          stopColor="#818cf8"
                          stopOpacity={0.01}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#263247"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="name"
                      tick={{
                        fill: '#94a3b8',
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{
                        fill: '#64748b',
                        fontSize: 10,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip contentStyle={tooltipStyle} />

                    <Area
                      type="monotone"
                      dataKey="value"
                      name="Analysis count"
                      stroke="#818cf8"
                      strokeWidth={3}
                      fill="url(#aiGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>

          {/* Operational Summary */}
          <div className="glass p-5">
            <div className="mb-5 flex items-center gap-2">
              <Zap size={18} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">
                Operational Summary
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: 'Open Tickets',
                  value: stats.open_tickets,
                },
                {
                  label: 'In Progress',
                  value: stats.in_progress_tickets,
                },
                {
                  label: 'Resolved',
                  value: stats.resolved_tickets,
                },
                {
                  label: 'Closed',
                  value: stats.closed_tickets,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4"
                >
                  <p className="text-[10px] text-slate-500">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="glass flex min-h-[250px] flex-col items-center justify-center gap-3">
          <AlertCircle size={28} className="text-slate-500" />
          <p className="text-sm text-slate-300">
            Analytics data is unavailable.
          </p>
          <button
            onClick={() => void loadAnalytics()}
            className="text-xs text-cyan-300 underline"
          >
            Try again
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-2">
          <Activity size={13} className="text-cyan-400" />
          IntelliDesk Analytics Engine
        </span>
        <span>Powered by FastAPI · Recharts · Ollama</span>
      </div>
    </div>
  )
}
