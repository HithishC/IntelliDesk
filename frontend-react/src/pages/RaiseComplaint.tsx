
import { useState } from 'react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  FilePlus2,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles,
  Ticket,
  Zap,
} from 'lucide-react'
import { createTicket, type CreateTicketResponse } from '../api/tickets'

interface RaiseComplaintProps {
  onNavigate?: (page: 'tickets' | 'dashboard') => void
}

const examples = [
  'College Wi-Fi network is completely down and students cannot connect.',
  'The college portal is not loading and students cannot access their results.',
  'Database server is unavailable and staff cannot retrieve student records.',
]

export default function RaiseComplaint({ onNavigate }: RaiseComplaintProps) {
  const [complaint, setComplaint] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<CreateTicketResponse | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedComplaint = complaint.trim()

    if (trimmedComplaint.length < 10) {
      setError('Please provide at least 10 characters describing the issue.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setResult(null)

      const response = await createTicket(trimmedComplaint)

      setResult(response)
      setComplaint('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit complaint. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const analysis = result?.analysis

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      {/* Heading */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" />
          <span className="text-[10px] font-bold tracking-[2px] text-cyan-400">
            AI-POWERED COMPLAINT INTAKE
          </span>
        </div>

        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Raise a Complaint
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Describe your issue. IntelliDesk will classify, analyze and route it
          to the appropriate support team.
        </p>
      </div>

      {/* Process Steps */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { number: '01', label: 'Submit Complaint' },
          { number: '02', label: 'AI Classification' },
          { number: '03', label: 'Priority Detection' },
          { number: '04', label: 'Team Assignment' },
        ].map((step) => (
          <div
            key={step.number}
            className="glass flex items-center gap-3 p-3"
          >
            <span className="text-lg font-bold text-cyan-400">
              {step.number}
            </span>
            <span className="text-[11px] font-medium text-slate-300">
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Success Result */}
      {result && (
        <div className="space-y-5">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2
                size={25}
                className="shrink-0 text-emerald-400"
              />

              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-emerald-300">
                  Complaint submitted successfully!
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Your complaint has been registered in IntelliDesk.
                </p>

                <div className="mt-4 rounded-xl border border-white/[0.08] bg-black/20 p-3">
                  <p className="text-[10px] tracking-wider text-slate-500">
                    GENERATED TICKET ID
                  </p>

                  <p className="mt-1 break-all font-mono text-sm text-cyan-300">
                    {result.ticket_id}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => onNavigate?.('tickets')}
                    className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2.5 text-xs font-bold text-slate-950 transition hover:bg-cyan-400"
                  >
                    View Tickets
                    <ArrowRight size={14} />
                  </button>

                  <button
                    onClick={() => setResult(null)}
                    className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 hover:bg-white/5"
                  >
                    Raise Another
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* AI Analysis */}
          <div className="glass overflow-hidden">
            <div className="flex items-center gap-3 border-b border-white/[0.07] p-5">
              <div className="rounded-xl bg-violet-400/10 p-2.5 text-violet-300">
                <Sparkles size={21} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  AI Analysis Result
                </h2>
                <p className="text-xs text-slate-500">
                  Analysis returned by the backend
                </p>
              </div>

              <span className="ml-auto rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] text-cyan-300">
                {result.gemini_status || 'Submitted'}
              </span>
            </div>

            {analysis && (
              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">
                <AnalysisItem
                  label="CATEGORY"
                  value={analysis.category}
                />
                <AnalysisItem
                  label="PRIORITY"
                  value={analysis.priority}
                />
                <AnalysisItem
                  label="URGENCY"
                  value={analysis.urgency}
                />
                <AnalysisItem
                  label="IMPACT"
                  value={analysis.impact}
                />
                <AnalysisItem
                  label="ASSIGNED TEAM"
                  value={analysis.assigned_team}
                />
                <AnalysisItem
                  label="AI PROVIDER"
                  value={analysis.ai_provider}
                />

                <div className="sm:col-span-2">
                  <AnalysisItem
                    label="AI SUMMARY"
                    value={analysis.summary}
                  />
                </div>

                <div className="sm:col-span-2">
                  <AnalysisItem
                    label="SUGGESTED ACTION"
                    value={analysis.suggested_action}
                  />
                </div>
              </div>
            )}

            {!analysis && (
              <p className="p-5 text-sm text-slate-400">
                The ticket was created, but no analysis details were returned.
                Check the Tickets page for the latest AI analysis status.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Complaint Form */}
      {!result && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_290px]">
          <form onSubmit={handleSubmit} className="glass p-5 sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-cyan-400/10 p-3 text-cyan-300">
                <FilePlus2 size={22} />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Complaint Details
                </h2>
                <p className="text-xs text-slate-500">
                  Provide accurate information about your issue.
                </p>
              </div>
            </div>

            <label
              htmlFor="complaint"
              className="mb-3 block text-xs font-semibold text-slate-300"
            >
              Describe your issue
            </label>

            <textarea
              id="complaint"
              value={complaint}
              onChange={(event) => setComplaint(event.target.value)}
              placeholder="Example: The college Wi-Fi has been unavailable since morning. Students and faculty are unable to access the internet in the academic block..."
              rows={9}
              maxLength={3000}
              disabled={loading}
              className="w-full resize-y rounded-xl border border-white/10 bg-[#080e1c] p-4 text-sm leading-7 text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10 disabled:opacity-50"
            />

            <div className="mt-2 flex justify-between text-[10px] text-slate-500">
              <span>Minimum 10 characters</span>
              <span>{complaint.length}/3000</span>
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.07] p-3 text-xs text-red-300">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || complaint.trim().length < 10}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/10 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Processing Complaint...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Submit Complaint
                </>
              )}
            </button>

            <p className="mt-4 text-center text-[10px] text-slate-500">
              Your complaint will be securely processed by IntelliDesk.
            </p>
          </form>

          {/* AI Information Panel */}
          <div className="space-y-4">
            <div className="glass p-5">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 text-cyan-300">
                <Cpu size={23} />
              </div>

              <h3 className="font-semibold text-white">
                AI Intelligence
              </h3>

              <p className="mt-2 text-xs leading-6 text-slate-400">
                Your complaint passes through the IntelliDesk intelligence
                pipeline for automatic classification and analysis.
              </p>

              <div className="mt-5 space-y-4">
                {[
                  {
                    icon: Sparkles,
                    title: 'Smart Classification',
                    desc: 'Identify the complaint category',
                  },
                  {
                    icon: AlertCircle,
                    title: 'Priority Detection',
                    desc: 'Estimate urgency and impact',
                  },
                  {
                    icon: ShieldCheck,
                    title: 'Team Routing',
                    desc: 'Identify the responsible team',
                  },
                  {
                    icon: Zap,
                    title: 'Solution Matching',
                    desc: 'Find relevant recommended solutions',
                  },
                ].map((item) => {
                  const Icon = item.icon

                  return (
                    <div key={item.title} className="flex gap-3">
                      <div className="mt-0.5 rounded-lg bg-white/[0.05] p-2 text-cyan-300">
                        <Icon size={15} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-200">
                          {item.title}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-500">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.05] p-4">
              <div className="flex items-center gap-2 text-cyan-300">
                <Ticket size={16} />
                <span className="text-xs font-semibold">
                  Automatic Ticket Generation
                </span>
              </div>

              <p className="mt-2 text-[11px] leading-5 text-slate-400">
                A unique ticket ID is generated after successful submission.
                You can track its progress from Ticket Management.
              </p>
            </div>

            <div className="glass p-4">
              <p className="text-[10px] font-bold tracking-wider text-slate-500">
                SUBMISSION GUIDELINES
              </p>

              <ul className="mt-3 space-y-2 text-[11px] leading-5 text-slate-400">
                <li>• Clearly describe the problem.</li>
                <li>• Mention the affected service or system.</li>
                <li>• Include when the issue started.</li>
                <li>• Avoid sharing passwords or private data.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AnalysisItem({
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
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
      <p className="text-[10px] font-bold tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-200">
        {displayValue || 'Not available'}
      </p>
    </div>
  )
}
