import { TransactionType } from "./transaction"

export interface PdfPreviewRow {
  rowId: string
  date: string
  description: string
  value: number
  type: TransactionType
  categoryName?: string
  possibleDuplicate: boolean
  rawLine?: string
  warnings?: string[]
}

export interface PdfParseResponse {
  importSessionId: string
  bankId: string
  rows: PdfPreviewRow[]
  warnings: string[]
}

export interface PdfConfirmRow {
  rowId: string
  date: string
  description: string
  value: number
  type: TransactionType
  categoryName: string
  excluded?: boolean
}

export interface PdfConfirmResult {
  persisted: number
  excluded: number
}
