
import { authenticatedRequest } from './api'

export interface Feedback {
  ticket_id: string
  solution_id: number | null
  resolved: boolean
  comments: string
  created_by?: string
  created_at?: string
  feedback_id?: string
}

export interface FeedbackResponse {
  total_feedback: number
  feedback: Feedback[]
}

export interface SubmitFeedbackRequest {
  ticket_id: string
  resolved: boolean
  comments?: string
  solution_id?: number | null
}

export interface SubmitFeedbackResponse {
  message: string
  feedback_id: string
  ticket_id: string
  solution_id: number | null
  resolved: boolean
}

export interface SolutionEffectiveness {
  solution_id: number
  total_feedback: number
  resolved: number
  not_resolved: number
  success_rate: number
}

export interface EffectivenessResponse {
  total_solutions_evaluated: number
  solution_effectiveness: SolutionEffectiveness[]
}

export async function fetchFeedback(): Promise<FeedbackResponse> {
  return authenticatedRequest<FeedbackResponse>('/feedback/')
}

export async function submitFeedback(
  data: SubmitFeedbackRequest
): Promise<SubmitFeedbackResponse> {
  return authenticatedRequest<SubmitFeedbackResponse>('/feedback/', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function fetchSolutionEffectiveness(): Promise<EffectivenessResponse> {
  return authenticatedRequest<EffectivenessResponse>(
    '/feedback/effectiveness'
  )
}

export async function fetchTicketFeedback(
  ticketId: string
): Promise<FeedbackResponse> {
  return authenticatedRequest<FeedbackResponse>(
    `/feedback/${encodeURIComponent(ticketId)}`
  )
}
