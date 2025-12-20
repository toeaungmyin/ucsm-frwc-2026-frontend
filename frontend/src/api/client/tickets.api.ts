import api from "../../lib/axios";
import type { VoterTicket } from "../../stores/voter.store";

export interface AuthenticateTicketResponse {
  success: boolean;
  data: {
    token: string;
    ticket: VoterTicket;
  };
  message: string;
}

export interface VerifyTicketResponse {
  success: boolean;
  data: {
    ticket: VoterTicket;
  };
  message: string;
}

export const clientTicketsApi = {
  /**
   * Authenticate a ticket by its UUID
   * Called when a voter scans the QR code on their ticket
   */
  authenticate: async (ticketId: string): Promise<AuthenticateTicketResponse["data"]> => {
    const response = await api.post<AuthenticateTicketResponse>("/client/tickets/auth", {
      ticketId,
    });
    return response.data.data;
  },

  /**
   * Verify the current voter token
   * Returns the ticket info if valid
   */
  verify: async (): Promise<VerifyTicketResponse["data"]> => {
    const response = await api.get<VerifyTicketResponse>("/client/tickets/verify");
    return response.data.data;
  },
};

