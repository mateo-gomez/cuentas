import { TransactionType } from "./transaction"

export interface PdfPreviewRow {
  rowId: string
  date: string
  description: string
  value: number
  type: TransactionType
  categoryName?: string
  possibleDuplicate: boolean
  // Advisory: the description looks like a credit-card payment. The review UI
  // offers to import it as a transfer to a credit account.
  suggestedTransfer?: boolean
  rawLine?: string
  warnings?: string[]
}

export interface PdfReconciliation {
  available: boolean
  reconciled: boolean
  openingBalance: number | null
  closingBalance: number | null
  computedDelta: number | null
  expectedDelta: number | null
  difference: number | null
}

export interface PdfParseResponse {
  importSessionId: string
  bankId: string
  rows: PdfPreviewRow[]
  warnings: string[]
  reconciliation: PdfReconciliation
}

export interface PdfConfirmRow {
  rowId: string
  date: string
  description: string
  value: number
  type: TransactionType
  categoryName: string
  excluded?: boolean
  // When true, persisted as a transfer to `transferToAccountId` (a credit
  // account) instead of a plain expense.
  isTransfer?: boolean
  transferToAccountId?: string
}

export interface PdfConfirmResult {
  persisted: number
  excluded: number
}
