import { useCallback, useState } from "react"
import { PdfConfirmResult, PdfConfirmRow, PdfParseResponse } from "../../types"
import { confirmPdfImport, parsePdfStatement } from "../services"
import { isApiError } from "../helpers"
import { createLogger } from "../lib/logger"

const logger = createLogger("usePdfImport")

type ParseState =
  | { status: "idle" }
  | { status: "parsing" }
  | { status: "parsed"; result: PdfParseResponse }
  | { status: "password_required"; message: string }
  | { status: "unsupported"; message: string }
  | { status: "error"; message: string }

type ConfirmState =
  | { status: "idle" }
  | { status: "confirming" }
  | { status: "done"; result: PdfConfirmResult }
  | { status: "error"; message: string }

const UNSUPPORTED_BANK_MESSAGE =
  "No reconocemos el banco de este extracto todavía."
const TOO_MANY_PAGES_MESSAGE =
  "El extracto tiene demasiadas páginas para procesarlo."
const PASSWORD_REQUIRED_MESSAGE =
  "El PDF está protegido con contraseña."

// Handles the two-step PDF import flow: parse (server-held preview) then
// confirm (persist the reviewed batch). Each step keeps its own state so the
// hook can be used both from the picker screen (parse) and the review screen
// (confirm) without one overwriting the other's status.
export const usePdfImport = () => {
  const [parseState, setParseState] = useState<ParseState>({ status: "idle" })
  const [confirmState, setConfirmState] = useState<ConfirmState>({ status: "idle" })

  const parse = useCallback(async (formData: FormData) => {
    setParseState({ status: "parsing" })

    try {
      const result = await parsePdfStatement(formData)
      setParseState({ status: "parsed", result })
      return result
    } catch (error) {
      logger.error("Error parsing PDF statement", { error })

      if (isApiError(error) && error.statusCode === 422) {
        const code = (error.errors as unknown as { code?: string } | undefined)?.code

        if (code === "password_required") {
          const message =
            error instanceof Error ? error.message : PASSWORD_REQUIRED_MESSAGE
          setParseState({ status: "password_required", message })
          return null
        }

        const message =
          code === "too_many_pages" ? TOO_MANY_PAGES_MESSAGE : UNSUPPORTED_BANK_MESSAGE
        setParseState({ status: "unsupported", message })
        return null
      }

      const message =
        error instanceof Error ? error.message : "No se pudo procesar el archivo."
      setParseState({ status: "error", message })
      return null
    }
  }, [])

  const confirm = useCallback(
    async (importSessionId: string, rows: PdfConfirmRow[], accountId: string) => {
      setConfirmState({ status: "confirming" })

      try {
        const result = await confirmPdfImport(importSessionId, rows, accountId)
        setConfirmState({ status: "done", result })
        return result
      } catch (error) {
        logger.error("Error confirming PDF import", { error })
        const message =
          error instanceof Error ? error.message : "No se pudo confirmar la importación."
        setConfirmState({ status: "error", message })
        return null
      }
    },
    [],
  )

  const resetParse = useCallback(() => setParseState({ status: "idle" }), [])
  const resetConfirm = useCallback(() => setConfirmState({ status: "idle" }), [])

  return { parseState, confirmState, parse, confirm, resetParse, resetConfirm }
}
