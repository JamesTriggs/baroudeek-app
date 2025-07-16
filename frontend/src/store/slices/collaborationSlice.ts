import { createSlice } from '@reduxjs/toolkit'

interface Collaborator {
  id: string
  username: string
  cursor?: { lat: number; lng: number }
  isActive: boolean
}

interface CollaborationSession {
  id: string
  routeId: string
  inviteCode: string
  collaborators: Collaborator[]
  createdAt: string
}

interface CollaborationState {
  activeSession: CollaborationSession | null
  isConnected: boolean
  error: string | null
}

const initialState: CollaborationState = {
  activeSession: null,
  isConnected: false,
  error: null,
}

const collaborationSlice = createSlice({
  name: 'collaboration',
  initialState,
  reducers: {
    setActiveSession: (state, action) => {
      state.activeSession = action.payload
    },
    setConnectionStatus: (state, action) => {
      state.isConnected = action.payload
    },
    addCollaborator: (state, action) => {
      if (state.activeSession) {
        state.activeSession.collaborators.push(action.payload)
      }
    },
    removeCollaborator: (state, action) => {
      if (state.activeSession) {
        state.activeSession.collaborators = state.activeSession.collaborators.filter(
          collaborator => collaborator.id !== action.payload
        )
      }
    },
    updateCollaboratorCursor: (state, action) => {
      if (state.activeSession) {
        const collaborator = state.activeSession.collaborators.find(
          c => c.id === action.payload.id
        )
        if (collaborator) {
          collaborator.cursor = action.payload.cursor
        }
      }
    },
    clearSession: (state) => {
      state.activeSession = null
      state.isConnected = false
    },
    setError: (state, action) => {
      state.error = action.payload
    },
  },
})

export const {
  setActiveSession,
  setConnectionStatus,
  addCollaborator,
  removeCollaborator,
  updateCollaboratorCursor,
  clearSession,
  setError,
} = collaborationSlice.actions

export default collaborationSlice.reducer