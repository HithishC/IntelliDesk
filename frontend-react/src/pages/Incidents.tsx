
import { useEffect, useState } from 'react'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ChevronDown,
  ChevronUp,
  Clock3,
  RefreshCw,
  Server,
  ShieldAlert,
  Users,
  XCircle,
} from 'lucide-react'
import {
  fetchIncidents,
  type Incident,
} from '../api/dashboard'

function priorityStyle(priority: string) {
  switch (priority.toLowerCase()) {
    case 'critical':
      return 'border-red-400/20 bg-red-400/10 text-red-300'
    case 'high':
      return 'border-orange-400/20 bg-orange-400/10 text-orange-300'
    case 'medium':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-300'
    case 'low':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
    default:
      return 'border-slate-400/20 bg-slate-400/10 text-slate-300'
  }
}

function statusStyle(status: string) {
  switch (status.toLowerCase()) {
    case 'resolved':
    case 'closed':
      return 'text-emerald-300 bg-emerald-400/10'
    case 'in progress':
      return 'text-amber-300 bg-amber-400/10'
    default:
      return 'text-blue-300 bg-blue-400/10'
  }
}

function IncidentPriority({ priority }: { priority: string }) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${priorityStyle(priority)}`}
    >
      {priority || 'Unknown'}
    </span>
  )
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  background,
}: {
  title: string
  value: number
  description: string
  icon: typeof Activity
  color: string
  background: string
}) {
  return (
    <div className="glass p-5 transition duration-300 hover:border-cyan-400/20">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold tracking-[1.5px] text-slate-500">
          {title}
        </p>
        <div className={`rounded-xl p-2.5 ${background} ${color}`}>
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-[11px] text-slate-500">{description}</p>
    </div>
  )
}

export default function Incidents() {
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [totalIncidents, setTotalIncidents] = useState(0)
  const [totalAffected, setTotalAffected] = useState(0)
  const [criticalIncidents, setCriticalIncidents] = useState(0)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expandedIncident, setExpandedIncident] = useState<string | null>(
    null
  )
  const [priorityFilter, setPriorityFilter] = useState('All')

  async function loadIncidents() {
    try {
      setLoading(true)
      setError('')

      const response = await fetchIncidents()

      setIncidents(response.incidents || [])
      setTotalIncidents(response.total_incidents || 0)
      setTotalAffected(response.total_affected_tickets || 0)
      setCriticalIncidents(response.critical_incidents || 0)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to retrieve incident information.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadIncidents()
  }, [])

  const filteredIncidents = incidents.filter((incident) => {
    return (
      priorityFilter === 'All' ||
      incident.priority?.toLowerCase() === priorityFilter.toLowerCase()
    )
  })

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
            <span className="text-[10px] font-bold tracking-[2px] text-red-400">
              INCIDENT INTELLIGENCE CENTER
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Incident Command Center
          </h1>

          <p className="mt-2 max-w-xl text-sm text-slate-400">
            Monitor grouped incidents, assess their impact and track
            response teams in real time.
          </p>
        </div>

        <button
          onClick={() => void loadIncidents()}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs font-medium text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300 disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh Incidents
        </button>
      </div>

      {/* Connection Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-cyan-400/10 p-2 text-cyan-300">
            <Activity size={17} />
          </div>
          <div>
            <p className="text-xs font-semibold text-white">
              Incident monitoring
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Connected to IntelliDesk incident API
            </p>
          </div>
        </div>

        <span className="flex items-center gap-2 text-[10px] font-semibold text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {loading ? 'FETCHING DATA' : error ? 'CONNECTION ISSUE' : 'API CHECK COMPLETE'}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-xs text-red-300">
          <AlertCircle size={17} className="shrink-0" />
          <div className="flex-1">{error}</div>
          <button
            onClick={() => void loadIncidents()}
            className="underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="TOTAL INCIDENTS"
          value={totalIncidents}
          description="Grouped system incidents"
          icon={Server}
          color="text-cyan-300"
          background="bg-cyan-400/10"
        />

        <MetricCard
          title="AFFECTED TICKETS"
          value={totalAffected}
          description="Tickets linked to incidents"
          icon={Users}
          color="text-violet-300"
          background="bg-violet-400/10"
        />

        <MetricCard
          title="CRITICAL INCIDENTS"
          value={criticalIncidents}
          description="Highest priority incidents"
          icon={ShieldAlert}
          color="text-red-300"
          background="bg-red-400/10"
        />

        <MetricCard
          title="MONITORED GROUPS"
          value={incidents.length}
          description="Incident groups returned by API"
          icon={Activity}
          color="text-emerald-300"
          background="bg-emerald-400/10"
        />
      </div>

      {/* Incident Priority Overview */}
      <div className="glass p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white">
              Incident Priority Overview
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Distribution of currently loaded incidents
            </p>
          </div>
          <AlertTriangle size={19} className="text-amber-400" />
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {['Critical', 'High', 'Medium', 'Low'].map((priority) => {
            const count = incidents.filter(
              (incident) =>
                incident.priority?.toLowerCase() === priority.toLowerCase()
            ).length

            return (
              <div
                key={priority}
                className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">{priority}</span>
                  <span
                    className={`h-2 w-2 rounded-full ${
                      priority === 'Critical'
                        ? 'bg-red-400'
                        : priority === 'High'
                          ? 'bg-orange-400'
                          : priority === 'Medium'
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                    }`}
                  />
                </div>
                <p className="mt-3 text-2xl font-bold text-white">{count}</p>
                <p className="mt-1 text-[10px] text-slate-500">
                  incidents
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Incident List */}
      <div className="glass overflow-hidden">
        <div className="flex flex-col justify-between gap-4 border-b border-white/[0.06] p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-white">
              Active Incident Groups
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Review grouped complaints and response assignments.
            </p>
          </div>

          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#080e1c] px-4 py-2.5 text-xs text-slate-300 outline-none focus:border-cyan-400/40"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        {loading ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">
            <RefreshCw size={27} className="animate-spin text-cyan-400" />
            <p className="text-xs text-slate-400">
              Loading incident intelligence...
            </p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">
            <ShieldAlert size={34} className="text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">
              No incidents found
            </p>
            <p className="text-xs text-slate-500">
              {incidents.length === 0
                ? 'No incident groups have been returned by the backend.'
                : 'Try selecting a different priority.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.05]">
            {filteredIncidents.map((incident, index) => {
              const isExpanded =
                expandedIncident === incident.incident_id

              const ticketCount =
                incident.affected_tickets ?? incident.tickets.length

              return (
                <div
                  key={incident.incident_id}
                  className="transition hover:bg-white/[0.015]"
                >
                  {/* Incident Row */}
                  <button
                    onClick={() =>
                      setExpandedIncident(
                        isExpanded ? null : incident.incident_id
                      )
                    }
                    className="flex w-full flex-col gap-4 p-5 text-left sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.07] text-cyan-300">
                        <span className="font-mono text-sm font-bold">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-white">
                            {incident.incident_id}
                          </span>
                          <IncidentPriority
                            priority={incident.priority}
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Users size={12} />
                            {incident.assigned_team || 'Unassigned'}
                          </span>

                          <span className="flex items-center gap-1.5">
                            <AlertCircle size={12} />
                            {ticketCount} affected tickets
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center justify-between gap-4 sm:justify-end">
                      <span className="text-[10px] text-slate-500">
                        {isExpanded ? 'Hide details' : 'View details'}
                      </span>

                      <div className="rounded-lg border border-white/10 p-2 text-slate-400">
                        {isExpanded ? (
                          <ChevronUp size={16} />
                        ) : (
                          <ChevronDown size={16} />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="space-y-4 border-t border-white/[0.05] bg-black/10 p-5">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                          <p className="text-[9px] font-bold tracking-wider text-slate-500">
                            INCIDENT PRIORITY
                          </p>
                          <div className="mt-3">
                            <IncidentPriority
                              priority={incident.priority}
                            />
                          </div>
                        </div>

                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                          <p className="text-[9px] font-bold tracking-wider text-slate-500">
                            RESPONSE TEAM
                          </p>
                          <p className="mt-3 text-xs font-semibold text-cyan-300">
                            {incident.assigned_team || 'Unassigned'}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                          <p className="text-[9px] font-bold tracking-wider text-slate-500">
                            AFFECTED TICKETS
                          </p>
                          <p className="mt-3 text-xl font-bold text-white">
                            {ticketCount}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold text-white">
                          <Activity size={14} className="text-cyan-400" />
                          Related Tickets
                        </h3>

                        {incident.tickets.length === 0 ? (
                          <p className="rounded-xl border border-white/[0.06] p-4 text-xs text-slate-500">
                            No ticket details available for this incident.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {incident.tickets.map((ticket) => (
                              <div
                                key={ticket.ticket_id}
                                className="flex flex-col justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4 sm:flex-row sm:items-center"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="font-mono text-[10px] text-cyan-300">
                                    {ticket.ticket_id}
                                  </p>
                                  <p className="mt-2 text-xs leading-5 text-slate-300">
                                    {ticket.complaint}
                                  </p>
                                </div>

                                <div className="flex shrink-0 flex-wrap items-center gap-2">
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyle(ticket.status)}`}
                                  >
                                    {ticket.status}
                                  </span>

                                  <IncidentPriority
                                    priority={ticket.priority}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-2">
          <Clock3 size={13} className="text-cyan-400" />
          Data retrieved from the IntelliDesk incident dashboard API
        </span>

        <span className="flex items-center gap-2">
          <ArrowDown size={13} />
          Select an incident to inspect related tickets
        </span>
      </div>
    </div>
  )
}
