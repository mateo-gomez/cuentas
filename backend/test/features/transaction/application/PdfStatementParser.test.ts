import { PdfStatementParser } from "../../../../src/features/transaction/application/useCases/PdfStatementParser";
import { InMemoryPreviewStore } from "../../../../src/features/transaction/infrastructure/services/InMemoryPreviewStore";
import { InMemoryTransactionRepository } from "../../../../src/features/transaction/infrastructure/database/InMemoryTransaction.repository";
import { TransactionType } from "../../../../src/domain/valueObjects/transactionType.valueObject";
import { FakePdfBankParser } from "../fakes/FakePdfBankParser";
import { ParsedStatement } from "../../../../src/features/transaction/domain/pdfImport/ParsedStatement";
import { Category } from "../../../../src/features/category/domain/category.entity";

const category: Category = {
	_id: "cat-1",
	name: "food",
	icon: "",
	createdAt: new Date(),
	updatedAt: new Date(),
};

const seedTransaction = async (
	repository: InMemoryTransactionRepository,
	date: Date,
	value: number,
	type: TransactionType,
	description: string,
	userId = "user-1",
) => {
	await repository.createTransaction({
		date,
		value,
		account: "",
		category,
		type,
		description,
		userId,
		accountId: "account-1",
	} as any);
};

const buildParser = (
	parsed: ParsedStatement,
	repository = new InMemoryTransactionRepository(),
) => {
	const previewStore = new InMemoryPreviewStore(1000, false);
	const parser = new PdfStatementParser(
		new FakePdfBankParser(parsed),
		previewStore,
		repository,
	);

	return { parser, previewStore, repository };
};

describe("PdfStatementParser", () => {
	test("stores the preview and returns rows with a stable session id, without persisting anything", async () => {
		const parsed: ParsedStatement = {
			bankId: "bancolombia",
			warnings: [],
		reconciliation: {
			available: false,
			reconciled: false,
			openingBalance: null,
			closingBalance: null,
			computedDelta: null,
			expectedDelta: null,
			difference: null,
		},
			rows: [
				{
					date: "2026-01-10",
					description: "Compra café",
					value: -12000,
					type: TransactionType.expenses,
					categoryName: "food",
				},
			],
		};
		const { parser, previewStore, repository } = buildParser(parsed);

		const result = await parser.execute("user-1", Buffer.from(""), "statement.pdf");

		expect(result.bankId).toBe("bancolombia");
		expect(result.rows).toHaveLength(1);
		expect(result.rows[0].possibleDuplicate).toBe(false);
		expect(previewStore.get(result.importSessionId)).not.toBeNull();
		expect(await repository.getAll("user-1")).toHaveLength(0);
	});

	test("flags a row as possibleDuplicate when it matches an existing transaction's natural key", async () => {
		const repository = new InMemoryTransactionRepository();
		await seedTransaction(
			repository,
			new Date("2026-01-10T00:00:00.000Z"),
			12000,
			TransactionType.expenses,
			"Compra Café",
		);

		const parsed: ParsedStatement = {
			bankId: "bancolombia",
			warnings: [],
		reconciliation: {
			available: false,
			reconciled: false,
			openingBalance: null,
			closingBalance: null,
			computedDelta: null,
			expectedDelta: null,
			difference: null,
		},
			rows: [
				{
					date: "2026-01-10",
					description: "  compra café  ",
					value: -12000,
					type: TransactionType.expenses,
				},
			],
		};
		const { parser } = buildParser(parsed, repository);

		const result = await parser.execute("user-1", Buffer.from(""), "statement.pdf");

		expect(result.rows[0].possibleDuplicate).toBe(true);
	});

	test("does NOT flag an income and an expense of equal magnitude as duplicates (signed value reconciliation)", async () => {
		const repository = new InMemoryTransactionRepository();
		// stored: income of magnitude 50000
		await seedTransaction(
			repository,
			new Date("2026-02-01T00:00:00.000Z"),
			50000,
			TransactionType.income,
			"Pago",
		);

		const parsed: ParsedStatement = {
			bankId: "bancolombia",
			warnings: [],
		reconciliation: {
			available: false,
			reconciled: false,
			openingBalance: null,
			closingBalance: null,
			computedDelta: null,
			expectedDelta: null,
			difference: null,
		},
			rows: [
				{
					// parsed: expense of the SAME magnitude, same day/description
					date: "2026-02-01",
					description: "Pago",
					value: -50000,
					type: TransactionType.expenses,
				},
			],
		};
		const { parser } = buildParser(parsed, repository);

		const result = await parser.execute("user-1", Buffer.from(""), "statement.pdf");

		expect(result.rows[0].possibleDuplicate).toBe(false);
	});

	test("threads reconciliation through unchanged from the parsed statement, without affecting confirm eligibility", async () => {
		const repository = new InMemoryTransactionRepository();
		const parsed: ParsedStatement = {
			bankId: "bancolombia",
			warnings: [],
			rows: [
				{
					date: "2026-01-10",
					description: "Compra",
					value: -1000,
					type: TransactionType.expenses,
				},
			],
			reconciliation: {
				available: true,
				reconciled: false,
				openingBalance: 5000,
				closingBalance: 4000,
				computedDelta: -1000,
				expectedDelta: -1000,
				difference: 0,
			},
		};
		const { parser, previewStore } = buildParser(parsed, repository);

		const result = await parser.execute("user-1", Buffer.from(""), "statement.pdf");

		expect(result.reconciliation).toEqual(parsed.reconciliation);
		// Reconciliation is advisory metadata only — it must not block/alter
		// the held preview or confirm eligibility (PdfImportConfirmer, PreviewStore
		// are unchanged and untouched by this field).
		expect(previewStore.get(result.importSessionId)).not.toBeNull();
	});

	test("re-uploading the same statement flags every row as possibleDuplicate", async () => {
		const repository = new InMemoryTransactionRepository();
		await seedTransaction(
			repository,
			new Date("2026-03-01T00:00:00.000Z"),
			1000,
			TransactionType.expenses,
			"Row A",
		);
		await seedTransaction(
			repository,
			new Date("2026-03-02T00:00:00.000Z"),
			2000,
			TransactionType.income,
			"Row B",
		);

		const parsed: ParsedStatement = {
			bankId: "bancolombia",
			warnings: [],
		reconciliation: {
			available: false,
			reconciled: false,
			openingBalance: null,
			closingBalance: null,
			computedDelta: null,
			expectedDelta: null,
			difference: null,
		},
			rows: [
				{ date: "2026-03-01", description: "Row A", value: -1000, type: TransactionType.expenses },
				{ date: "2026-03-02", description: "Row B", value: 2000, type: TransactionType.income },
			],
		};
		const { parser } = buildParser(parsed, repository);

		const result = await parser.execute("user-1", Buffer.from(""), "statement.pdf");

		expect(result.rows.every((row) => row.possibleDuplicate)).toBe(true);
	});

	test("overlapping statement only flags the overlapping rows, not the new ones", async () => {
		const repository = new InMemoryTransactionRepository();
		await seedTransaction(
			repository,
			new Date("2026-01-15T00:00:00.000Z"),
			5000,
			TransactionType.expenses,
			"January purchase",
		);

		const parsed: ParsedStatement = {
			bankId: "bancolombia",
			warnings: [],
		reconciliation: {
			available: false,
			reconciled: false,
			openingBalance: null,
			closingBalance: null,
			computedDelta: null,
			expectedDelta: null,
			difference: null,
		},
			rows: [
				{
					date: "2026-01-15",
					description: "January purchase",
					value: -5000,
					type: TransactionType.expenses,
				},
				{
					date: "2026-02-15",
					description: "February purchase",
					value: -3000,
					type: TransactionType.expenses,
				},
			],
		};
		const { parser } = buildParser(parsed, repository);

		const result = await parser.execute("user-1", Buffer.from(""), "statement.pdf");

		const january = result.rows.find((row) => row.description === "January purchase");
		const february = result.rows.find((row) => row.description === "February purchase");

		expect(january?.possibleDuplicate).toBe(true);
		expect(february?.possibleDuplicate).toBe(false);
	});

	test("runs exactly one findForDedup call for a non-empty batch, and none for an empty batch", async () => {
		const repository = new InMemoryTransactionRepository();
		const spy = jest.spyOn(repository, "findForDedup");

		const parsed: ParsedStatement = {
			bankId: "bancolombia",
			warnings: [],
		reconciliation: {
			available: false,
			reconciled: false,
			openingBalance: null,
			closingBalance: null,
			computedDelta: null,
			expectedDelta: null,
			difference: null,
		},
			rows: [
				{ date: "2026-01-01", description: "A", value: -100, type: TransactionType.expenses },
				{ date: "2026-01-05", description: "B", value: 200, type: TransactionType.income },
			],
		};
		const { parser } = buildParser(parsed, repository);
		await parser.execute("user-1", Buffer.from(""), "statement.pdf");

		expect(spy).toHaveBeenCalledTimes(1);

		spy.mockClear();

		const { parser: emptyParser } = buildParser(
			{
				bankId: "bancolombia",
				warnings: [],
				rows: [],
				reconciliation: {
					available: false,
					reconciled: false,
					openingBalance: null,
					closingBalance: null,
					computedDelta: null,
					expectedDelta: null,
					difference: null,
				},
			},
			repository,
		);
		await emptyParser.execute("user-1", Buffer.from(""), "statement.pdf");

		expect(spy).not.toHaveBeenCalled();
	});

	test("dedup ignores another user's same-date/value/description transaction", async () => {
		const repository = new InMemoryTransactionRepository();
		// Same date/value/description as the parsed row below, but owned by a different user.
		await seedTransaction(
			repository,
			new Date("2026-04-01T00:00:00.000Z"),
			1000,
			TransactionType.expenses,
			"Shared description",
			"other-user",
		);

		const parsed: ParsedStatement = {
			bankId: "bancolombia",
			warnings: [],
			reconciliation: {
				available: false,
				reconciled: false,
				openingBalance: null,
				closingBalance: null,
				computedDelta: null,
				expectedDelta: null,
				difference: null,
			},
			rows: [
				{
					date: "2026-04-01",
					description: "Shared description",
					value: -1000,
					type: TransactionType.expenses,
				},
			],
		};
		const { parser } = buildParser(parsed, repository);

		const result = await parser.execute("user-1", Buffer.from(""), "statement.pdf");

		expect(result.rows[0].possibleDuplicate).toBe(false);
	});
});
