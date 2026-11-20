
import { authenticatedRequest } from './api'

export interface DashboardStats {
  total_tickets: number
  open_tickets: number
  in_progress_tickets: number
  resolved_tickets: number
  closed_tickets: number
  critical_tickets: number
  resolution_rate: number
  tickets_by_status: Record<string, number>
  tickets_by_priority: Record<string, number>
  tickets_by_category: Record<string, number>
  ai_analysis_completed: number
  ai_analysis_pending: number
  ai_analysis_unavailable: number
  total_incidents: number
}

export interface IncidentTicket {
  ticket_id: string
  complaint: string
  status: string
  priority: string
}

export interface Incident {
  incident_id: string
  tickets: IncidentTicket[]
  assigned_team: string
  priority: string
  affected_tickets: number
}

export interface IncidentsResponse {
  total_incidents: number
  total_affected_tickets: number
  critical_incidents: number
  incidents: Incident[]
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return authenticatedRequest<DashboardStats>('/dashboard/stats')
}

export async function fetchIncidents(): Promise<IncidentsResponse> {
  return authenticatedRequest<IncidentsResponse>('/incidents/dashboard')
}
