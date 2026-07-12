import { TransactionRepository } from "../../domain/Transaction.repository";
import { PdfBankParser } from "../../domain/pdfImport/PdfBankParser";
import { PreviewStore } from "../../domain/pdfImport/PreviewStore";
import { RawParsedTransaction, Reconciliation } from "../../domain/pdfImport/ParsedStatement";
import { PreviewRow } from "../dto/pdfImportDTO";
import {
	dayKeyFromDate,
	dayKeyFromISODate,
	endOfUTCDay,
	naturalKey,
	signedValueFromStored,
	startOfUTCDay,
} from "../services/naturalKey";

export interface PdfParseResult {
	importSessionId: string;
	bankId: string;
	rows: PreviewRow[];
	warnings: string[];
	reconciliation: Reconciliation;
}

export class PdfStatementParser {
	constructor(
		private readonly pdfBankParser: PdfBankParser,
		private readonly previewStore: PreviewStore,
		private readonly transactionRepository: TransactionRepository,
	) {}

	execute = async (
		pdf: Buffer,
		filename: string,
		password?: string,
	): Promise<PdfParseResult> => {
		const parsed = await this.pdfBankParser.parse(pdf, filename, password);

		const duplicateKeys = await this.buildDuplicateKeySet(parsed.rows);

		const rows: PreviewRow[] = parsed.rows.map((row) => ({
			rowId: crypto.randomUUID(),
			date: row.date,
			description: row.description,
			value: row.value,
			type: row.type,
			categoryName: row.categoryName,
			possibleDuplicate: duplicateKeys.has(
				naturalKey(dayKeyFromISODate(row.date), row.value, row.description),
			),
			rawLine: row.rawLine,
			warnings: row.warnings,
		}));

		const importSessionId = this.previewStore.put(rows, parsed.bankId, parsed.warnings);

		return {
			importSessionId,
			bankId: parsed.bankId,
			rows,
			warnings: parsed.warnings,
			reconciliation: parsed.reconciliation,
		};
	};

	private buildDuplicateKeySet = async (
		rows: RawParsedTransaction[],
	): Promise<Set<string>> => {
		if (rows.length === 0) {
			return new Set();
		}

		const dates = rows.map((row) => new Date(row.date).getTime());
		const from = startOfUTCDay(new Date(Math.min(...dates)));
		const to = endOfUTCDay(new Date(Math.max(...dates)));

		const existing = await this.transactionRepository.findForDedup(from, to);

		return new Set(
			existing.map((transaction) =>
				naturalKey(
					dayKeyFromDate(transaction.date),
					signedValueFromStored(transaction.value, transaction.type),
					transaction.description,
				),
			),
		);
	};
}
