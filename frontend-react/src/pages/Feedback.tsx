
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Clock3,
  MessageSquare,
  RefreshCw,
  Send,
  Star,
  Target,
  ThumbsDown,
  ThumbsUp,
  TrendingUp,
} from 'lucide-react'

import {
  fetchFeedback,
  fetchSolutionEffectiveness,
  submitFeedback,
  type Feedback,
  type SolutionEffectiveness,
} from '../api/feedback'

import {
  fetchTickets,
  type Ticket,
} from '../api/tickets'

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [effectiveness, setEffectiveness] = useState<
    SolutionEffectiveness[]
  >([])
  const [tickets, setTickets] = useState<Ticket[]>([])

  const [selectedTicket, setSelectedTicket] = useState('')
  const [selectedSolution, setSelectedSolution] = useState('')
  const [resolved, setResolved] = useState<boolean | null>(null)
  const [comments, setComments] = useState('')

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadData() {
    try {
      setLoading(true)
      setError('')

      const [feedbackResponse, effectivenessResponse, ticketsResponse] =
        await Promise.all([
          fetchFeedback(),
          fetchSolutionEffectiveness(),
          fetchTickets(),
        ])

      setFeedback(feedbackResponse.feedback || [])

      setEffectiveness(
        effectivenessResponse.solution_effectiveness || []
      )

      setTickets(ticketsResponse.tickets || [])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load feedback information.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const resolvedTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'Resolved'),
    [tickets]
  )

  const currentTicket = resolvedTickets.find(
    (ticket) => ticket.ticket_id === selectedTicket
  )

  const recommendedSolutions = useMemo(() => {
    const solutions = currentTicket?.ai_analysis?.recommended_solutions

    if (!Array.isArray(solutions)) return []

    return solutions.map((solution, index) => {
      if (
        typeof solution === 'string' ||
        typeof solution === 'number'
      ) {
        return {
          id: index,
          label: String(solution),
        }
      }

      if (solution && typeof solution === 'object') {
        const item = solution as Record<string, unknown>

        const label =
          item.solution ??
          item.title ??
          item.description ??
          item.name

        return {
          id:
            typeof item.solution_id === 'number'
              ? item.solution_id
              : index,
          label:
            typeof label === 'string'
              ? label
              : `Recommended solution ${index + 1}`,
        }
      }

      return {
        id: index,
        label: `Recommended solution ${index + 1}`,
      }
    })
  }, [currentTicket])

  const totalFeedback = feedback.length

  const successfulFeedback = feedback.filter(
    (item) => item.resolved
  ).length

  const unsuccessfulFeedback = totalFeedback - successfulFeedback

  const overallSuccessRate =
    totalFeedback > 0
      ? (successfulFeedback / totalFeedback) * 100
      : 0

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!selectedTicket) {
      setError('Please select a resolved ticket.')
      return
    }

    if (resolved === null) {
      setError('Please indicate whether the solution resolved the issue.')
      return
    }

    try {
      setSubmitting(true)
      setError('')
      setSuccess('')

      const payload: {
        ticket_id: string
        resolved: boolean
        comments?: string
        solution_id?: number | null
      } = {
        ticket_id: selectedTicket,
        resolved,
        comments: comments.trim(),
      }

      if (selectedSolution !== '') {
        payload.solution_id = Number(selectedSolution)
      }

      const response = await submitFeedback(payload)

      setSuccess(response.message || 'Feedback submitted successfully.')

      setSelectedTicket('')
      setSelectedSolution('')
      setResolved(null)
      setComments('')

      await loadData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit feedback.'
      )
    } finally {
      setSubmitting(false)
    }
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

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold tracking-[2px] text-emerald-400">
              FEEDBACK INTELLIGENCE
            </span>
          </div>

          <h1 className="text-2xl font-bold text-white sm:text-3xl">
            Feedback & Effectiveness
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Measure solution performance and collect feedback to improve
            future complaint resolution.
          </p>
        </div>

        <button
          onClick={() => void loadData()}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-slate-300 transition hover:border-cyan-400/30 hover:text-cyan-300 disabled:opacity-50"
        >
          <RefreshCw
            size={14}
            className={loading ? 'animate-spin' : ''}
          />
          Refresh Data
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/[0.06] p-4 text-xs text-red-300">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] p-4 text-xs text-emerald-300">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="glass flex min-h-[300px] flex-col items-center justify-center gap-3">
          <RefreshCw
            size={28}
            className="animate-spin text-cyan-400"
          />
          <p className="text-xs text-slate-400">
            Loading feedback intelligence...
          </p>
        </div>
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              title="TOTAL FEEDBACK"
              value={totalFeedback}
              description="Feedback submissions"
              icon={MessageSquare}
              color="text-cyan-300"
              background="bg-cyan-400/10"
            />

            <Metric
              title="SUCCESSFUL SOLUTIONS"
              value={successfulFeedback}
              description="Reported as resolved"
              icon={ThumbsUp}
              color="text-emerald-300"
              background="bg-emerald-400/10"
            />

            <Metric
              title="UNSUCCESSFUL"
              value={unsuccessfulFeedback}
              description="Reported as unresolved"
              icon={ThumbsDown}
              color="text-red-300"
              background="bg-red-400/10"
            />

            <Metric
              title="OVERALL SUCCESS RATE"
              value={`${overallSuccessRate.toFixed(1)}%`}
              description="Based on submitted feedback"
              icon={Target}
              color="text-violet-300"
              background="bg-violet-400/10"
            />
          </div>

          {/* Submission Form */}
          <div className="glass overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/[0.06] p-5">
              <div className="rounded-xl bg-cyan-400/10 p-2.5 text-cyan-300">
                <Send size={19} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">
                  Submit Resolution Feedback
                </h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  Evaluate a resolved ticket and its recommended solution.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-wider text-slate-400">
                  SELECT RESOLVED TICKET
                </label>

                <select
                  value={selectedTicket}
                  onChange={(event) => {
                    setSelectedTicket(event.target.value)
                    setSelectedSolution('')
                  }}
                  className="w-full rounded-xl border border-white/10 bg-[#080e1c] px-4 py-3 text-xs text-white outline-none focus:border-cyan-400/40"
                >
                  <option value="">Choose a resolved ticket</option>

                  {resolvedTickets.map((ticket) => (
                    <option
                      key={ticket.ticket_id}
                      value={ticket.ticket_id}
                    >
                      {ticket.ticket_id.slice(0, 12)} —{' '}
                      {ticket.complaint.slice(0, 65)}
                    </option>
                  ))}
                </select>

                {resolvedTickets.length === 0 && (
                  <p className="mt-2 text-[10px] text-amber-300">
                    No tickets with Resolved status are currently available.
                  </p>
                )}
              </div>

              {currentTicket && (
                <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.04] p-4">
                  <p className="text-[9px] font-bold tracking-wider text-cyan-300">
                    SELECTED TICKET
                  </p>

                  <p className="mt-2 text-xs leading-6 text-slate-300">
                    {currentTicket.complaint}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-slate-500">
                    <span>
                      Category: {currentTicket.ai_analysis?.category || 'Unknown'}
                    </span>
                    <span>•</span>
                    <span>
                      Team: {currentTicket.ai_analysis?.assigned_team || 'Unassigned'}
                    </span>
                  </div>
                </div>
              )}

              {currentTicket && recommendedSolutions.length > 0 && (
                <div>
                  <label className="mb-2 block text-[10px] font-bold tracking-wider text-slate-400">
                    RECOMMENDED SOLUTION
                  </label>

                  <select
                    value={selectedSolution}
                    onChange={(event) =>
                      setSelectedSolution(event.target.value)
                    }
                    className="w-full rounded-xl border border-white/10 bg-[#080e1c] px-4 py-3 text-xs text-white outline-none focus:border-cyan-400/40"
                  >
                    <option value="">No specific solution selected</option>

                    {recommendedSolutions.map((solution) => (
                      <option
                        key={solution.id}
                        value={solution.id}
                      >
                        {solution.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-3 block text-[10px] font-bold tracking-wider text-slate-400">
                  DID THE SOLUTION RESOLVE THE ISSUE?
                </label>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setResolved(true)}
                    className={`flex items-center justify-center gap-3 rounded-xl border p-4 text-xs font-semibold transition ${
                      resolved === true
                        ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-emerald-400/20'
                    }`}
                  >
                    <ThumbsUp size={17} />
                    Yes, Resolved
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolved(false)}
                    className={`flex items-center justify-center gap-3 rounded-xl border p-4 text-xs font-semibold transition ${
                      resolved === false
                        ? 'border-red-400/40 bg-red-400/10 text-red-300'
                        : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-red-400/20'
                    }`}
                  >
                    <ThumbsDown size={17} />
                    No, Not Resolved
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold tracking-wider text-slate-400">
                  ADDITIONAL COMMENTS
                </label>

                <textarea
                  value={comments}
                  onChange={(event) => setComments(event.target.value)}
                  placeholder="Describe your experience with the resolution..."
                  rows={4}
                  maxLength={1000}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#080e1c] p-4 text-xs leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
                />

                <p className="mt-1 text-right text-[10px] text-slate-600">
                  {comments.length}/1000 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedTicket || resolved === null}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3.5 text-xs font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Submitting Feedback...
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    Submit Feedback
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Solution Effectiveness */}
          <div className="glass overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/[0.06] p-5">
              <div className="rounded-xl bg-violet-400/10 p-2.5 text-violet-300">
                <TrendingUp size={19} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">
                  Solution Effectiveness
                </h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  Performance based on recorded feedback
                </p>
              </div>
            </div>

            {effectiveness.length === 0 ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center gap-3 p-5">
                <Target size={28} className="text-slate-600" />
                <p className="text-xs text-slate-400">
                  No solution effectiveness data available yet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-[10px] tracking-wider text-slate-500">
                      <th className="px-5 py-4">SOLUTION ID</th>
                      <th className="px-5 py-4">TOTAL FEEDBACK</th>
                      <th className="px-5 py-4">RESOLVED</th>
                      <th className="px-5 py-4">UNRESOLVED</th>
                      <th className="px-5 py-4">SUCCESS RATE</th>
                    </tr>
                  </thead>

                  <tbody>
                    {effectiveness.map((item) => (
                      <tr
                        key={item.solution_id}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                      >
                        <td className="px-5 py-4 font-mono text-xs text-cyan-300">
                          #{item.solution_id}
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-300">
                          {item.total_feedback}
                        </td>

                        <td className="px-5 py-4 text-xs text-emerald-300">
                          {item.resolved}
                        </td>

                        <td className="px-5 py-4 text-xs text-red-300">
                          {item.not_resolved}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-white">
                              {Number(item.success_rate).toFixed(1)}%
                            </span>

                            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-800">
                              <div
                                className="h-full rounded-full bg-emerald-400"
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(100, item.success_rate)
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Feedback History */}
          <div className="glass overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Recent Feedback History
                </h2>
                <p className="mt-1 text-[10px] text-slate-500">
                  Previously submitted resolution feedback
                </p>
              </div>

              <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] text-cyan-300">
                {feedback.length} RECORDS
              </span>
            </div>

            {feedback.length === 0 ? (
              <div className="flex min-h-[180px] flex-col items-center justify-center gap-3">
                <MessageSquare size={28} className="text-slate-600" />
                <p className="text-xs text-slate-400">
                  No feedback submissions yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.05]">
                {feedback.map((item, index) => (
                  <div
                    key={item.feedback_id || `${item.ticket_id}-${index}`}
                    className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-start"
                  >
                    <div className="flex min-w-0 items-start gap-3">
                      <div
                        className={`rounded-xl p-2.5 ${
                          item.resolved
                            ? 'bg-emerald-400/10 text-emerald-300'
                            : 'bg-red-400/10 text-red-300'
                        }`}
                      >
                        {item.resolved ? (
                          <ThumbsUp size={17} />
                        ) : (
                          <ThumbsDown size={17} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="font-mono text-xs text-cyan-300">
                          {item.ticket_id}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-500">
                          {formatDate(item.created_at)}
                        </p>

                        {item.comments && (
                          <p className="mt-3 break-words text-xs leading-6 text-slate-300">
                            {item.comments}
                          </p>
                        )}

                        <p className="mt-2 text-[10px] text-slate-500">
                          Solution ID:{' '}
                          {item.solution_id ?? 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold ${
                        item.resolved
                          ? 'bg-emerald-400/10 text-emerald-300'
                          : 'bg-red-400/10 text-red-300'
                      }`}
                    >
                      {item.resolved ? 'Resolved' : 'Not Resolved'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-2">
          <Activity size={13} className="text-cyan-400" />
          IntelliDesk Feedback Intelligence
        </span>

        <span>Powered by FastAPI · Firebase · Solution Analytics</span>
      </div>
    </div>
  )
}

function Metric({
  title,
  value,
  description,
  icon: Icon,
  color,
  background,
}: {
  title: string
  value: string | number
  description: string
  icon: typeof Activity
  color: string
  background: string
}) {
  return (
    <div className="glass p-5 transition hover:border-cyan-400/20">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold tracking-wider text-slate-500">
          {title}
        </p>

        <div className={`rounded-xl p-2.5 ${background} ${color}`}>
          <Icon size={19} />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold text-white">{value}</p>

      <p className="mt-2 text-[10px] text-slate-500">
        {description}
      </p>
    </div>
  )
}
