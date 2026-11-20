
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  Ticket as TicketIcon,
  X,
} from 'lucide-react'
import {
  fetchTickets,
  updateTicketStatus,
  type Ticket,
} from '../api/tickets'

type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed'

const statuses: TicketStatus[] = [
  'Open',
  'In Progress',
  'Resolved',
  'Closed',
]

const statusStyles: Record<string, string> = {
  Open: 'border-blue-400/20 bg-blue-400/10 text-blue-300',
  'In Progress': 'border-amber-400/20 bg-amber-400/10 text-amber-300',
  Resolved: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
  Closed: 'border-slate-400/20 bg-slate-400/10 text-slate-300',
}

const priorityStyles: Record<string, string> = {
  Critical: 'bg-red-400/10 text-red-300',
  High: 'bg-orange-400/10 text-orange-300',
  Medium: 'bg-amber-400/10 text-amber-300',
  Low: 'bg-emerald-400/10 text-emerald-300',
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
        statusStyles[status] || statusStyles.Open
      }`}
    >
      {status}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        priorityStyles[priority] || 'bg-slate-400/10 text-slate-300'
      }`}
    >
      {priority}
    </span>
  )
}

function formatDate(value?: string) {
  if (!value) return 'Unknown'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Unknown'

  return date.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function Tickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [priorityFilter, setPriorityFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  async function loadTickets() {
    try {
      setLoading(true)
      setError('')

      const response = await fetchTickets()
      setTickets(response.tickets || [])

      setSelectedTicket((current) => {
        if (!current) return null
        return (
          response.tickets.find(
            (ticket) => ticket.ticket_id === current.ticket_id
          ) || null
        )
      })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load tickets'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadTickets()
  }, [])

  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          tickets
            .map((ticket) => ticket.ai_analysis?.category)
            .filter((category): category is string => Boolean(category))
        )
      ).sort(),
    [tickets]
  )

  const filteredTickets = useMemo(() => {
    const query = search.toLowerCase().trim()

    return tickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        ticket.ticket_id.toLowerCase().includes(query) ||
        ticket.complaint.toLowerCase().includes(query) ||
        (ticket.ai_analysis?.assigned_team || '')
          .toLowerCase()
          .includes(query)

      const matchesStatus =
        statusFilter === 'All' || ticket.status === statusFilter

      const matchesPriority =
        priorityFilter === 'All' ||
        ticket.ai_analysis?.priority === priorityFilter

      const matchesCategory =
        categoryFilter === 'All' ||
        ticket.ai_analysis?.category === categoryFilter

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory
      )
    })
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter])

  const counts = useMemo(
    () => ({
      total: tickets.length,
      open: tickets.filter((ticket) => ticket.status === 'Open').length,
      progress: tickets.filter((ticket) => ticket.status === 'In Progress')
        .length,
      resolved: tickets.filter(
        (ticket) =>
          ticket.status === 'Resolved' || ticket.status === 'Closed'
      ).length,
    }),
    [tickets]
  )

  async function handleStatusChange(
    ticketId: string,
    newStatus: TicketStatus
  ) {
    try {
      setUpdatingId(ticketId)
      setError('')

      await updateTicketStatus(ticketId, newStatus)
      await loadTickets()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update ticket status'
      )
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="text-[10px] font-bold tracking-[2px] text-cyan-400">
              TICKET OPERATIONS
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Ticket Management
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Track, search, filter and manage all submitted complaints.
          </p>
        </div>

        <button
          onClick={() => void loadTickets()}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300 disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh Tickets
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-4 text-xs text-red-300">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          {
            label: 'TOTAL TICKETS',
            value: counts.total,
            icon: TicketIcon,
            color: 'text-cyan-300',
            bg: 'bg-cyan-400/10',
          },
          {
            label: 'OPEN',
            value: counts.open,
            icon: AlertCircle,
            color: 'text-blue-300',
            bg: 'bg-blue-400/10',
          },
          {
            label: 'IN PROGRESS',
            value: counts.progress,
            icon: Clock3,
            color: 'text-amber-300',
            bg: 'bg-amber-400/10',
          },
          {
            label: 'RESOLVED / CLOSED',
            value: counts.resolved,
            icon: CheckCircle2,
            color: 'text-emerald-300',
            bg: 'bg-emerald-400/10',
          },
        ].map((item) => {
          const Icon = item.icon

          return (
            <div key={item.label} className="glass p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold tracking-wider text-slate-500">
                  {item.label}
                </p>
                <div className={`rounded-lg p-2 ${item.bg} ${item.color}`}>
                  <Icon size={17} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-white">
                {item.value}
              </p>
            </div>
          )
        })}
      </div>

      {/* Filters */}
      <div className="glass space-y-4 p-4 sm:p-5">
        <div className="flex items-center gap-2">
          <Filter size={17} className="text-cyan-400" />
          <h2 className="text-sm font-semibold text-white">
            Search & Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tickets..."
              className="w-full rounded-xl border border-white/10 bg-[#080e1c] py-3 pl-10 pr-3 text-xs text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
            />
          </div>

          <FilterSelect
            label="Status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={['All', ...statuses]}
          />

          <FilterSelect
            label="Priority"
            value={priorityFilter}
            onChange={setPriorityFilter}
            options={['All', 'Critical', 'High', 'Medium', 'Low']}
          />

          <FilterSelect
            label="Category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={['All', ...categories]}
          />
        </div>

        {(search ||
          statusFilter !== 'All' ||
          priorityFilter !== 'All' ||
          categoryFilter !== 'All') && (
          <button
            onClick={() => {
              setSearch('')
              setStatusFilter('All')
              setPriorityFilter('All')
              setCategoryFilter('All')
            }}
            className="flex items-center gap-1.5 text-xs text-cyan-300 hover:text-cyan-200"
          >
            <X size={13} />
            Clear all filters
          </button>
        )}
      </div>

      {/* Ticket Table */}
      <div className="glass overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
          <div>
            <h2 className="font-semibold text-white">All Tickets</h2>
            <p className="mt-1 text-xs text-slate-500">
              {filteredTickets.length} matching tickets
            </p>
          </div>

          <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] text-cyan-300">
            FIRESTORE DATA
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center gap-3">
            <RefreshCw size={26} className="animate-spin text-cyan-400" />
            <p className="text-xs text-slate-400">Loading tickets...</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center gap-3">
            <TicketIcon size={30} className="text-slate-600" />
            <p className="text-sm font-medium text-slate-300">
              No tickets found
            </p>
            <p className="text-xs text-slate-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.015] text-[10px] tracking-wider text-slate-500">
                  <th className="px-5 py-4 font-semibold">TICKET</th>
                  <th className="px-5 py-4 font-semibold">COMPLAINT</th>
                  <th className="px-5 py-4 font-semibold">CATEGORY</th>
                  <th className="px-5 py-4 font-semibold">PRIORITY</th>
                  <th className="px-5 py-4 font-semibold">STATUS</th>
                  <th className="px-5 py-4 font-semibold">AI ANALYSIS</th>
                  <th className="px-5 py-4 font-semibold">ACTION</th>
                </tr>
              </thead>

              <tbody>
                {filteredTickets.map((ticket) => {
                  const analysis = ticket.ai_analysis
                  const aiStatus =
                    ticket.ai_status ||
                    ticket.gemini_status ||
                    'Unknown'

                  return (
                    <tr
                      key={ticket.ticket_id}
                      className="border-b border-white/[0.04] transition hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-cyan-300">
                          {ticket.ticket_id.slice(0, 8)}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-600">
                          {formatDate(ticket.created_at)}
                        </p>
                      </td>

                      <td className="max-w-[250px] px-5 py-4">
                        <p className="truncate text-xs text-slate-300">
                          {ticket.complaint}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {analysis?.assigned_team || 'Unassigned'}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-400">
                        {analysis?.category || 'Pending'}
                      </td>

                      <td className="px-5 py-4">
                        <PriorityBadge
                          priority={analysis?.priority || 'Unknown'}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={ticket.status} />
                      </td>

                      <td className="px-5 py-4">
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              aiStatus.toLowerCase() === 'completed'
                                ? 'bg-emerald-400'
                                : aiStatus.toLowerCase() === 'pending'
                                  ? 'bg-amber-400'
                                  : 'bg-slate-500'
                            }`}
                          />
                          {aiStatus}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedTicket(ticket)}
                          className="rounded-lg border border-white/10 px-3 py-2 text-[10px] font-semibold text-cyan-300 transition hover:border-cyan-400/30 hover:bg-cyan-400/5"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedTicket(null)
            }
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d1424] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.07] p-5">
              <div>
                <p className="text-[10px] tracking-wider text-cyan-400">
                  TICKET DETAILS
                </p>
                <h2 className="mt-1 font-semibold text-white">
                  {selectedTicket.ticket_id.slice(0, 13)}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTicket(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-500">
                  COMPLAINT DESCRIPTION
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-300">
                  {selectedTicket.complaint}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailItem
                  label="CATEGORY"
                  value={selectedTicket.ai_analysis?.category}
                />
                <DetailItem
                  label="PRIORITY"
                  value={selectedTicket.ai_analysis?.priority}
                />
                <DetailItem
                  label="URGENCY"
                  value={selectedTicket.ai_analysis?.urgency}
                />
                <DetailItem
                  label="IMPACT"
                  value={selectedTicket.ai_analysis?.impact}
                />
                <DetailItem
                  label="ASSIGNED TEAM"
                  value={selectedTicket.ai_analysis?.assigned_team}
                />
                <DetailItem
                  label="INCIDENT ID"
                  value={selectedTicket.incident_id}
                />
              </div>

              <DetailItem
                label="AI SUMMARY"
                value={selectedTicket.ai_analysis?.summary}
              />

              <DetailItem
                label="SUGGESTED ACTION"
                value={selectedTicket.ai_analysis?.suggested_action}
              />

              <div>
                <p className="mb-2 text-[10px] font-bold tracking-wider text-slate-500">
                  UPDATE TICKET STATUS
                </p>

                <div className="relative">
                  <select
                    value={selectedTicket.status}
                    disabled={updatingId === selectedTicket.ticket_id}
                    onChange={(event) =>
                      void handleStatusChange(
                        selectedTicket.ticket_id,
                        event.target.value as TicketStatus
                      )
                    }
                    className="w-full appearance-none rounded-xl border border-white/10 bg-[#080e1c] px-4 py-3 text-xs text-white outline-none focus:border-cyan-400/40 disabled:opacity-50"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>

                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                </div>

                {updatingId === selectedTicket.ticket_id && (
                  <p className="mt-2 flex items-center gap-2 text-[10px] text-cyan-300">
                    <RefreshCw size={12} className="animate-spin" />
                    Updating ticket...
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 border-t border-white/[0.06] pt-4 text-[10px] text-slate-500">
                <ShieldCheck size={14} className="text-emerald-400" />
                Created: {formatDate(selectedTicket.created_at)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-[10px] text-slate-500">
        <Activity size={13} className="text-cyan-400" />
        Ticket information is loaded from your authenticated backend API.
      </div>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[]
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-xl border border-white/10 bg-[#080e1c] px-3 py-3 pr-9 text-xs text-slate-300 outline-none focus:border-cyan-400/40"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === 'All' ? `All ${label}s` : option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </div>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value?: unknown
}) {
  const displayValue =
    typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : ''

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
      <p className="text-[9px] font-bold tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap break-words text-xs leading-5 text-slate-200">
        {displayValue || 'Not available'}
      </p>
    </div>
  )
}
