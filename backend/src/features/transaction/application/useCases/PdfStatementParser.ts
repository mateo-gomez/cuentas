import { TransactionRepository } from "../../domain/Transaction.repository";
import { TransactionType } from "../../../../domain/valueObjects/transactionType.valueObject";
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
import { isLikelyCardPayment } from "../services/cardPaymentDetection";
import { CategoryClassifier } from "../services/categoryClassifier";
import { CategoryRepository } from "../../../category/domain/category.repository";

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
		private readonly categoryClassifier: CategoryClassifier,
		private readonly categoryRepository: CategoryRepository,
	) {}

	execute = async (
		userId: string,
		pdf: Buffer,
		filename: string,
		password?: string,
	): Promise<PdfParseResult> => {
		const parsed = await this.pdfBankParser.parse(pdf, filename, password);

		const duplicateKeys = await this.buildDuplicateKeySet(userId, parsed.rows);

		// Classify against the user's OWN categories (defaults + custom), not a
		// fixed list, so a suggestion links to a category the user actually has.
		const categories = await this.categoryRepository.getAllForUser(userId);

		const rows: PreviewRow[] = parsed.rows.map((row) => ({
			rowId: crypto.randomUUID(),
			date: row.date,
			description: row.description,
			value: row.value,
			type: row.type,
			// The rule-based PDF parser doesn't classify, so fill an empty category
			// with a keyword-based suggestion. Left as a suggestion only — the user
			// can still override it in the import review before confirming.
			categoryName:
				row.categoryName?.trim() ||
				this.categoryClassifier.localClassify(row.description, categories),
			possibleDuplicate: duplicateKeys.has(
				naturalKey(dayKeyFromISODate(row.date), row.value, row.description),
			),
			// Only outgoing money (expenses) can be a card payment from this account.
			suggestedTransfer:
				row.type === TransactionType.expenses &&
				isLikelyCardPayment(row.description),
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
		userId: string,
		rows: RawParsedTransaction[],
	): Promise<Set<string>> => {
		if (rows.length === 0) {
			return new Set();
		}

		const dates = rows.map((row) => new Date(row.date).getTime());
		const from = startOfUTCDay(new Date(Math.min(...dates)));
		const to = endOfUTCDay(new Date(Math.max(...dates)));

		const existing = await this.transactionRepository.findForDedup(
			userId,
			from,
			to,
		);

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
