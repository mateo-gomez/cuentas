import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";
import { InternalError } from "../../../../infrastructure/api/errors/internalError";
import { UnsupportedBankError } from "../../../../infrastructure/api/errors/unsupportedBankError";
import pdfParserConfig from "../../../../infrastructure/config/pdfParser.config";
import { PdfBankParser } from "../../domain/pdfImport/PdfBankParser";
import {
	ParsedStatement,
	Reconciliation,
	RawParsedTransaction,
} from "../../domain/pdfImport/ParsedStatement";

const REQUEST_TIMEOUT_MS = 30_000;
const RETRYABLE_STATUS_CODES = [502, 503, 504];

interface RawPythonTransaction {
	date: unknown;
	description: unknown;
	value: unknown;
	type: unknown;
	categoryName?: unknown;
	rawLine?: unknown;
	warnings?: unknown;
}

interface RawPythonReconciliation {
	available?: unknown;
	reconciled?: unknown;
	openingBalance?: unknown;
	closingBalance?: unknown;
	computedDelta?: unknown;
	expectedDelta?: unknown;
	difference?: unknown;
}

interface RawPythonParseResponse {
	bankId: unknown;
	transactions: unknown;
	warnings?: unknown;
	reconciliation?: unknown;
}

const UNAVAILABLE_RECONCILIATION: Reconciliation = {
	available: false,
	reconciled: false,
	openingBalance: null,
	closingBalance: null,
	computedDelta: null,
	expectedDelta: null,
	difference: null,
};

const nullableNumber = (value: unknown): number | null =>
	typeof value === "number" && Number.isFinite(value) ? value : null;

const assertReconciliation = (value: unknown): Reconciliation => {
	if (typeof value !== "object" || value === null) {
		return UNAVAILABLE_RECONCILIATION;
	}

	const candidate = value as RawPythonReconciliation;

	return {
		available: candidate.available === true,
		reconciled: candidate.reconciled === true,
		openingBalance: nullableNumber(candidate.openingBalance),
		closingBalance: nullableNumber(candidate.closingBalance),
		computedDelta: nullableNumber(candidate.computedDelta),
		expectedDelta: nullableNumber(candidate.expectedDelta),
		difference: nullableNumber(candidate.difference),
	};
};

const toDomainType = (type: unknown): TransactionType => {
	if (type === "income") return TransactionType.income;
	if (type === "expenses") return TransactionType.expenses;

	throw new InternalError(
		`El servicio de parseo devolvió un type inválido: ${String(type)}`,
	);
};

const assertRawTransaction = (row: unknown): RawParsedTransaction => {
	const candidate = row as RawPythonTransaction;

	if (
		typeof candidate !== "object" ||
		candidate === null ||
		typeof candidate.date !== "string" ||
		isNaN(new Date(candidate.date).getTime())
	) {
		throw new InternalError(
			"El servicio de parseo devolvió una transacción con fecha inválida",
		);
	}

	if (
		typeof candidate.description !== "string" ||
		candidate.description.trim().length === 0
	) {
		throw new InternalError(
			"El servicio de parseo devolvió una transacción con descripción inválida",
		);
	}

	if (typeof candidate.value !== "number" || !Number.isFinite(candidate.value)) {
		throw new InternalError(
			"El servicio de parseo devolvió una transacción con value inválido",
		);
	}

	if (candidate.type !== "income" && candidate.type !== "expenses") {
		throw new InternalError(
			"El servicio de parseo devolvió una transacción con type inválido",
		);
	}

	return {
		date: candidate.date,
		description: candidate.description,
		value: candidate.value,
		type: toDomainType(candidate.type),
		categoryName:
			typeof candidate.categoryName === "string" ? candidate.categoryName : undefined,
		rawLine: typeof candidate.rawLine === "string" ? candidate.rawLine : undefined,
		warnings: Array.isArray(candidate.warnings)
			? candidate.warnings.filter((w): w is string => typeof w === "string")
			: undefined,
	};
};

export const assertParseResponse = (payload: unknown): ParsedStatement => {
	const candidate = payload as RawPythonParseResponse;

	if (
		typeof candidate !== "object" ||
		candidate === null ||
		typeof candidate.bankId !== "string" ||
		candidate.bankId.trim().length === 0
	) {
		throw new InternalError(
			"El servicio de parseo devolvió una respuesta sin bankId válido",
		);
	}

	if (!Array.isArray(candidate.transactions)) {
		throw new InternalError(
			"El servicio de parseo devolvió una respuesta sin transactions",
		);
	}

	const rows = candidate.transactions.map(assertRawTransaction);

	const warnings = Array.isArray(candidate.warnings)
		? candidate.warnings.filter((w): w is string => typeof w === "string")
		: [];

	const reconciliation =
		"reconciliation" in candidate
			? assertReconciliation(candidate.reconciliation)
			: UNAVAILABLE_RECONCILIATION;

	return { bankId: candidate.bankId, rows, warnings, reconciliation };
};

export class HttpPdfBankParser implements PdfBankParser {
	private readonly baseUrl: string;

	constructor(baseUrl: string = pdfParserConfig.PDF_PARSER_URL) {
		this.baseUrl = baseUrl;
	}

	parse = async (
		pdf: Buffer,
		filename: string,
		password?: string,
	): Promise<ParsedStatement> => {
		const response = await this.requestWithRetry(pdf, filename, password);

		if (response.status === 422) {
			const body = await response.json().catch(() => ({}));
			const code =
				body?.code === "too_many_pages" || body?.code === "password_required"
					? body.code
					: "unrecognized_bank";

			throw new UnsupportedBankError(
				body?.message || "El banco de este PDF no está soportado",
				code,
			);
		}

		if (!response.ok) {
			throw new InternalError(
				`El servicio de parseo respondió con status ${response.status}`,
			);
		}

		const json = await response.json();

		return assertParseResponse(json);
	};

	private requestWithRetry = async (
		pdf: Buffer,
		filename: string,
		password?: string,
		attempt = 0,
	): Promise<Response> => {
		try {
			return await this.doRequest(pdf, filename, password);
		} catch (error) {
			if (attempt < 1 && this.isRetryableNetworkError(error)) {
				return this.requestWithRetry(pdf, filename, password, attempt + 1);
			}

			throw new InternalError(
				"No se pudo contactar al servicio de parseo de PDF",
				error instanceof Error ? error : undefined,
			);
		}
	};

	private doRequest = async (
		pdf: Buffer,
		filename: string,
		password?: string,
	): Promise<Response> => {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

		try {
			const formData = new FormData();
			formData.append(
				"file",
				new Blob([pdf], { type: "application/pdf" }),
				filename,
			);

			if (password) {
				formData.append("password", password);
			}

			const response = await fetch(`${this.baseUrl}/parse`, {
				method: "POST",
				body: formData,
				signal: controller.signal,
			});

			if (RETRYABLE_STATUS_CODES.includes(response.status)) {
				throw new RetryableHttpError(response.status);
			}

			return response;
		} finally {
			clearTimeout(timeout);
		}
	};

	private isRetryableNetworkError = (error: unknown): boolean => {
		if (error instanceof RetryableHttpError) return true;

		// Connection errors (ECONNREFUSED, fetch failed, abort on timeout, etc.)
		return error instanceof Error;
	};
}

class RetryableHttpError extends Error {
	constructor(public readonly status: number) {
		super(`Retryable HTTP status ${status}`);
	}
}
