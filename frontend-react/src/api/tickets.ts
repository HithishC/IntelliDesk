
import { authenticatedRequest } from './api'

export interface TicketAnalysis {
  category?: string
  priority?: string
  urgency?: string
  impact?: string
  summary?: string
  suggested_action?: string
  assigned_team?: string
  incident_id?: string
  recommended_solutions?: unknown[]
  ai_provider?: string
  [key: string]: unknown
}

export interface Ticket {
  ticket_id: string
  complaint: string
  incident_id?: string
  ai_analysis?: TicketAnalysis
  ai_status?: string
  gemini_status?: string
  status: string
  created_at?: string
  created_by?: string
  updated_at?: string
}

export interface TicketsResponse {
  total_tickets: number
  tickets: Ticket[]
}

export interface CreateTicketResponse {
  message: string
  ticket_id: string
  gemini_status: string
  analysis: TicketAnalysis
}

export async function fetchTickets(): Promise<TicketsResponse> {
  return authenticatedRequest<TicketsResponse>('/tickets/')
}

export async function createTicket(
  complaint: string
): Promise<CreateTicketResponse> {
  return authenticatedRequest<CreateTicketResponse>('/tickets/', {
    method: 'POST',
    body: JSON.stringify({ complaint }),
  })
}

export async function fetchTicketById(
  ticketId: string
): Promise<Ticket> {
  return authenticatedRequest<Ticket>(
    `/tickets/${encodeURIComponent(ticketId)}`
  )
}

export async function updateTicketStatus(
  ticketId: string,
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed'
) {
  return authenticatedRequest(
    `/tickets/${encodeURIComponent(ticketId)}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }
  )
}
