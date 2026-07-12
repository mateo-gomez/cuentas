import { PdfConfirmResult, PdfConfirmRow, PdfParseResponse } from "../../types"
import { client } from "../helpers"

export const parsePdfStatement = async (
  formData: FormData,
): Promise<PdfParseResponse> => {
  const { data } = await client.upload<{ data: PdfParseResponse }>(
    "transactions/import/pdf",
    formData,
  )

  return data
}

export const confirmPdfImport = async (
  importSessionId: string,
  rows: PdfConfirmRow[],
): Promise<PdfConfirmResult> => {
  const { data } = await client.post<{ data: PdfConfirmResult }>(
    "transactions/import/pdf/confirm",
    { importSessionId, rows },
  )

  return data
}
