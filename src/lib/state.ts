import type { AppAction, AppState } from './types'

export const initialAppState: AppState = {
  tender: null,
  requirements: [],
  files: [],
  matches: {},
  expiries: {},
  uploadError: null,
  requirementsError: null,
}

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_REQUIREMENTS': {
      const initialMatches: Record<string, string | null> = {}
      action.payload.requirements.forEach((r) => {
        initialMatches[r.id] = null
      })

      return {
        ...state,
        tender: action.payload.tender,
        requirements: action.payload.requirements,
        matches: initialMatches,
        expiries: {},
        requirementsError: null,
      }
    }

    case 'SET_REQUIREMENTS_ERROR': {
      return {
        ...state,
        requirementsError: action.error,
      }
    }

    case 'ADD_FILES': {
      return {
        ...state,
        files: [...state.files, ...action.files],
      }
    }

    case 'REMOVE_FILE': {
      const remainingFiles = state.files.filter((f) => f.id !== action.fileId)
      const nextMatches = { ...state.matches }
      const nextExpiries = { ...state.expiries }

      // Unmatch any requirement mapped to this file and clear its expiry
      for (const [reqId, matchedId] of Object.entries(nextMatches)) {
        if (matchedId === action.fileId) {
          nextMatches[reqId] = null
          delete nextExpiries[reqId]
        }
      }

      return {
        ...state,
        files: remainingFiles,
        matches: nextMatches,
        expiries: nextExpiries,
      }
    }

    case 'SET_MATCH': {
      const currentMatched = state.matches[action.requirementId]
      const nextMatches = {
        ...state.matches,
        [action.requirementId]: action.fileId,
      }
      const nextExpiries = { ...state.expiries }

      // If match changed or set to null, reset the expiry date for this requirement
      if (currentMatched !== action.fileId) {
        delete nextExpiries[action.requirementId]
      }

      return {
        ...state,
        matches: nextMatches,
        expiries: nextExpiries,
      }
    }

    case 'SET_EXPIRY': {
      return {
        ...state,
        expiries: {
          ...state.expiries,
          [action.requirementId]: action.expiry,
        },
      }
    }

    case 'SET_UPLOAD_ERROR': {
      return {
        ...state,
        uploadError: action.error,
      }
    }

    case 'RESET_ALL': {
      return initialAppState
    }

    default:
      return state
  }
}
