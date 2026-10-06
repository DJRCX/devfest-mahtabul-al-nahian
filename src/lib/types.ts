export type Language = 'en' | 'bn'

export interface Tender {
  tender_id: string
  title: string
  procuring_entity: string
  bidder: string
  submission_deadline: string // YYYY-MM-DD
}

export interface Requirement {
  id: string
  order: number
  title_en: string
  title_bn: string
  mandatory: boolean
  has_expiry: boolean
}

export interface RequirementsPayload {
  tender: Tender
  requirements: Requirement[]
}

export interface UploadedFile {
  id: string
  name: string
  size: number
  bytes: Uint8Array
  pageCount: number
  hash: string // SHA-256 hex string
  error?: string
}

export type RequirementStatus =
  | 'OK'
  | 'MISSING'
  | 'EXPIRY_NEEDED'
  | 'EXPIRED'
  | 'NOT_PROVIDED'

export interface StatusDetail {
  status: RequirementStatus
  blocking: boolean
  reasonEn?: string
  reasonBn?: string
}

export type Matches = Record<string, string | null> // requirementId -> fileId | null
export type Expiries = Record<string, string> // requirementId -> YYYY-MM-DD

export interface AppState {
  tender: Tender | null
  requirements: Requirement[]
  files: UploadedFile[]
  matches: Matches
  expiries: Expiries
  uploadError: { en: string; bn: string } | null
  requirementsError: { en: string; bn: string } | null
}

export type AppAction =
  | { type: 'SET_REQUIREMENTS'; payload: RequirementsPayload }
  | { type: 'SET_REQUIREMENTS_ERROR'; error: { en: string; bn: string } | null }
  | { type: 'ADD_FILES'; files: UploadedFile[] }
  | { type: 'REMOVE_FILE'; fileId: string }
  | { type: 'SET_UPLOAD_ERROR'; error: { en: string; bn: string } | null }
  | { type: 'SET_MATCH'; requirementId: string; fileId: string | null }
  | { type: 'SET_EXPIRY'; requirementId: string; expiry: string }
  | { type: 'RESET_ALL' }
