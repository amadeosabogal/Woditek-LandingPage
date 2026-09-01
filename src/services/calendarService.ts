import { apiFetch } from './api';

interface CreateMeetRequest {
  summary?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  generateMeet?: boolean;
}

interface CreateMeetResponse {
  message: string;
  meetLink: string;
  eventId: string;
  eventHtmlLink: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  meetLink?: string;
  description?: string;
  htmlLink?: string;
  oportunidad_id?: number;
  oportunidad_name?: string;
  usuario?: {
    nombre: string;
    apellido: string;
    email: string;
    avatar?: string;
  };
}

class CalendarService {
  async connectCalendar(code: string): Promise<{ message: string }> {
    return apiFetch('/api/calendar/connect', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
  }

  async createMeet(data: CreateMeetRequest): Promise<CreateMeetResponse> {
    return apiFetch('/api/calendar/meet', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async getEvents(proyectoId?: number): Promise<CalendarEvent[]> {
    const url = proyectoId ? `/api/calendar/events?proyectoId=${proyectoId}` : '/api/calendar/events';
    return apiFetch(url);
  }

  async deleteMeet(eventId: string): Promise<{ message: string }> {
    return apiFetch(`/api/calendar/meet/${eventId}`, {
      method: 'DELETE'
    });
  }

  async updateMeet(eventId: string, data: { summary?: string, description?: string }): Promise<{ message: string }> {
    return apiFetch(`/api/calendar/meet/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
}

export const calendarService = new CalendarService();
export default calendarService;
