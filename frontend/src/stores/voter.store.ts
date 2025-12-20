import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VoterTicket {
  id: string;
  serial: string;
  votedCategories: string[];
}

interface VoterState {
  token: string | null;
  ticket: VoterTicket | null;
  isAuthenticated: boolean;
  setAuth: (token: string, ticket: VoterTicket) => void;
  updateVotedCategories: (categoryIds: string[]) => void;
  logout: () => void;
}

export const useVoterStore = create<VoterState>()(
  persist(
    (set) => ({
      token: null,
      ticket: null,
      isAuthenticated: false,
      setAuth: (token, ticket) =>
        set({ token, ticket, isAuthenticated: true }),
      updateVotedCategories: (categoryIds) =>
        set((state) => ({
          ticket: state.ticket
            ? { ...state.ticket, votedCategories: categoryIds }
            : null,
        })),
      logout: () =>
        set({ token: null, ticket: null, isAuthenticated: false }),
    }),
    {
      name: 'voter-storage',
    }
  )
);

